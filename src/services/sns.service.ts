import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class SNSNotificationService {
  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      });
      await snsClient.send(command);
      console.log(`SMS sent to ${phoneNumber}: ${message}`);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new Error('Failed to send SMS notification');
    }
  }

  async sendReminderSMS(phoneNumber: string, title: string, description: string): Promise<void> {
    const message = `Health Tracker Reminder: ${title}${description ? ` - ${description}` : ''}`;
    await this.sendSMS(phoneNumber, message);
  }

  async sendPeriodAlert(phoneNumber: string): Promise<void> {
    const message = 'Your period is starting today. Track your symptoms in the app.';
    await this.sendSMS(phoneNumber, message);
  }
}
