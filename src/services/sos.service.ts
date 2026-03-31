import { prisma } from '../utils/prisma';
import { SNSNotificationService } from './sns.service';

const snsService = new SNSNotificationService();

export class SOSService {
  async triggerSOS(userId: string, input: { latitude: number; longitude: number }) {
    // Fetch all trusted contacts for the user
    const contacts = await prisma.trustedContact.findMany({
      where: { userId },
    });

    // Get user info for the alert message
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    const locationLink = `https://maps.google.com/?q=${input.latitude},${input.longitude}`;
    const message = `EMERGENCY SOS from ${user?.firstName || 'User'} ${user?.lastName || ''}! They need help. Location: ${locationLink}`;

    // Send SMS to all trusted contacts
    let contactsNotified = 0;
    for (const contact of contacts) {
      try {
        await snsService.sendSMS(contact.phoneNumber, message);
        contactsNotified++;
      } catch (error) {
        console.error(`Failed to notify contact ${contact.name}:`, error);
      }
    }

    // Create the SOS alert record
    const alert = await prisma.sOSAlert.create({
      data: {
        userId,
        latitude: input.latitude,
        longitude: input.longitude,
        status: 'sent',
        contactsNotified,
      },
    });

    return alert;
  }

  async resolveAlert(userId: string, alertId: string, status: string) {
    const existing = await prisma.sOSAlert.findFirst({
      where: { id: alertId, userId },
    });
    if (!existing) {
      throw new Error('SOS alert not found');
    }
    if (existing.status !== 'sent') {
      throw new Error('Alert has already been resolved');
    }

    return prisma.sOSAlert.update({
      where: { id: alertId },
      data: { status },
    });
  }

  async getUserAlerts(userId: string) {
    return prisma.sOSAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
