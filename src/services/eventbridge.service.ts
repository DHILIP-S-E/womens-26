import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
  DeleteRuleCommand,
  DescribeRuleCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-eventbridge';
import {
  LambdaClient,
  AddPermissionCommand,
  RemovePermissionCommand,
} from '@aws-sdk/client-lambda';
import { prisma } from '../utils/prisma';

interface ReminderShape {
  id: string;
  frequency: string;
  scheduledTime: Date;
  isActive: boolean;
}

const RULE_PREFIX = 'reminder-';
const PERIOD_ALERT_RULE = 'period-alert-daily';
const TARGET_ID = 'reminder-target';

export class EventBridgeService {
  private readonly ebClient: EventBridgeClient;
  private readonly lambdaClient: LambdaClient;
  private readonly busName: string;
  private readonly reminderProcessorArn: string;
  private readonly periodAlertArn: string;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.ebClient = new EventBridgeClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    this.lambdaClient = new LambdaClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    const busName = process.env.EVENTBRIDGE_BUS_NAME || 'default';
    this.busName = busName === 'default' ? '' : busName;
    this.reminderProcessorArn = process.env.LAMBDA_REMINDER_PROCESSOR_ARN || '';
    this.periodAlertArn = process.env.LAMBDA_PERIOD_ALERT_ARN || '';
  }

  async upsertReminderRule(reminder: ReminderShape): Promise<string> {
    if (!reminder.isActive) {
      await this.deleteReminderRule(reminder.id);
      return '';
    }

    const ruleName = `${RULE_PREFIX}${reminder.id}`;
    const scheduleExpression = this.toEventBridgeCron(reminder.frequency, reminder.scheduledTime);
    if (!scheduleExpression) {
      throw new Error(`Unsupported frequency: ${reminder.frequency}`);
    }

    const putRuleResp = await this.ebClient.send(new PutRuleCommand({
      Name: ruleName,
      ScheduleExpression: scheduleExpression,
      State: 'ENABLED',
      ...(this.busName && { EventBusName: this.busName }),
      Description: `Auto-generated rule for reminder ${reminder.id}`,
    }));

    const ruleArn = putRuleResp.RuleArn ?? '';

    await this.ensureLambdaInvokePermission(
      this.reminderProcessorArn,
      `allow-eb-${ruleName}`,
      ruleArn,
    );

    await this.ebClient.send(new PutTargetsCommand({
      Rule: ruleName,
      ...(this.busName && { EventBusName: this.busName }),
      Targets: [{
        Id: TARGET_ID,
        Arn: this.reminderProcessorArn,
        Input: JSON.stringify({ reminderId: reminder.id }),
      }],
    }));

    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { eventBridgeRuleArn: ruleArn },
    });

    return ruleArn;
  }

  async deleteReminderRule(reminderId: string): Promise<void> {
    const ruleName = `${RULE_PREFIX}${reminderId}`;

    const exists = await this.ruleExists(ruleName);
    if (!exists) return;

    await this.ebClient.send(new RemoveTargetsCommand({
      Rule: ruleName,
      ...(this.busName && { EventBusName: this.busName }),
      Ids: [TARGET_ID],
    }));

    await this.ebClient.send(new DeleteRuleCommand({
      Name: ruleName,
      ...(this.busName && { EventBusName: this.busName }),
    }));

    try {
      await this.lambdaClient.send(new RemovePermissionCommand({
        FunctionName: this.reminderProcessorArn,
        StatementId: `allow-eb-${ruleName}`,
      }));
    } catch {
      // Permission may not exist — ignore
    }
  }

  async ensurePeriodAlertRule(): Promise<void> {
    if (!this.periodAlertArn) {
      console.warn('LAMBDA_PERIOD_ALERT_ARN not set, skipping period alert rule setup');
      return;
    }

    const putRuleResp = await this.ebClient.send(new PutRuleCommand({
      Name: PERIOD_ALERT_RULE,
      ScheduleExpression: 'cron(0 8 * * ? *)',
      State: 'ENABLED',
      ...(this.busName && { EventBusName: this.busName }),
      Description: 'Daily 8 AM UTC period alert check',
    }));

    const ruleArn = putRuleResp.RuleArn ?? '';

    await this.ensureLambdaInvokePermission(
      this.periodAlertArn,
      `allow-eb-${PERIOD_ALERT_RULE}`,
      ruleArn,
    );

    await this.ebClient.send(new PutTargetsCommand({
      Rule: PERIOD_ALERT_RULE,
      ...(this.busName && { EventBusName: this.busName }),
      Targets: [{
        Id: 'period-alert-target',
        Arn: this.periodAlertArn,
      }],
    }));

    console.log('Period alert EventBridge rule ensured');
  }

  private async ruleExists(ruleName: string): Promise<boolean> {
    try {
      await this.ebClient.send(new DescribeRuleCommand({
        Name: ruleName,
        ...(this.busName && { EventBusName: this.busName }),
      }));
      return true;
    } catch (err) {
      if (err instanceof ResourceNotFoundException) return false;
      throw err;
    }
  }

  private async ensureLambdaInvokePermission(
    functionArn: string,
    statementId: string,
    sourceArn: string,
  ): Promise<void> {
    try {
      await this.lambdaClient.send(new AddPermissionCommand({
        FunctionName: functionArn,
        StatementId: statementId,
        Action: 'lambda:InvokeFunction',
        Principal: 'events.amazonaws.com',
        SourceArn: sourceArn,
      }));
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'ResourceConflictException') throw err;
    }
  }

  private toEventBridgeCron(frequency: string, scheduledTime: Date): string | null {
    const min = scheduledTime.getUTCMinutes();
    const hr = scheduledTime.getUTCHours();
    const dom = scheduledTime.getUTCDate();
    const dow = scheduledTime.getUTCDay() + 1;
    const month = scheduledTime.getUTCMonth() + 1;
    const year = scheduledTime.getUTCFullYear();

    switch (frequency) {
      case 'daily':
        return `cron(${min} ${hr} * * ? *)`;
      case 'weekly':
        return `cron(${min} ${hr} ? * ${dow} *)`;
      case 'monthly':
        return `cron(${min} ${hr} ${dom} * ? *)`;
      case 'once':
        return `cron(${min} ${hr} ${dom} ${month} ? ${year})`;
      default:
        return null;
    }
  }
}
