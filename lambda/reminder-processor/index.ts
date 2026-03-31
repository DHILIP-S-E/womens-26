import {
  EventBridgeClient,
  RemoveTargetsCommand,
  DeleteRuleCommand,
} from '@aws-sdk/client-eventbridge';
import { getDbClient } from '../shared/db';
import { sendReminderSMS } from '../shared/sns';

interface ReminderEvent {
  reminderId: string;
}

const ebClient = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const RULE_PREFIX = 'reminder-';
const BUS_NAME = process.env.EVENTBRIDGE_BUS_NAME || 'default';

export const handler = async (event: ReminderEvent): Promise<void> => {
  try {
    await processReminder(event);
  } catch (err) {
    console.error('Unhandled error in reminder-processor:', err);
    throw err;
  }
};

async function processReminder(event: ReminderEvent): Promise<void> {
  const { reminderId } = event;
  if (!reminderId) {
    console.error('Missing reminderId in event payload');
    return;
  }

  const prisma = getDbClient();

  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!reminder || !reminder.isActive) {
    console.log(`Reminder ${reminderId} is inactive or not found, skipping`);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: reminder.userId } });
  const phoneNumber = user?.phoneNumber || process.env.AWS_SNS_PHONE_NUMBER || '';

  if (!phoneNumber) {
    console.warn(`No phone number for user ${reminder.userId}, skipping SMS`);
  } else {
    await sendReminderSMS(phoneNumber, reminder.title, reminder.description);
    console.log(`SMS sent for reminder ${reminderId}`);
  }

  // One-time reminders: deactivate and clean up the EventBridge rule
  if (reminder.frequency === 'once') {
    await prisma.reminder.update({ where: { id: reminderId }, data: { isActive: false } });

    const ruleName = `${RULE_PREFIX}${reminderId}`;
    try {
      await ebClient.send(new RemoveTargetsCommand({
        Rule: ruleName,
        EventBusName: BUS_NAME,
        Ids: ['reminder-target'],
      }));
      await ebClient.send(new DeleteRuleCommand({
        Name: ruleName,
        EventBusName: BUS_NAME,
      }));
      console.log(`Cleaned up EventBridge rule ${ruleName} after one-time fire`);
    } catch (err) {
      console.error(`Failed to delete EventBridge rule ${ruleName}:`, err);
    }
  }
}
