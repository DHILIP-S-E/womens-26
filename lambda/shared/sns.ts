import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const client = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function sendReminderSMS(
  phoneNumber: string,
  title: string,
  description: string,
): Promise<void> {
  const message = `Health Tracker Reminder: ${title}${description ? ` - ${description}` : ''}`;
  await client.send(new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: message,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    },
  }));
}

export async function sendPeriodAlert(phoneNumber: string): Promise<void> {
  await client.send(new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: 'Your period is starting today. Track your symptoms in the app.',
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
    },
  }));
}
