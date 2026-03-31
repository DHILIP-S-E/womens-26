import { prisma } from '../utils/prisma';
import { EventBridgeService } from './eventbridge.service';

export interface CreateReminderInput {
  type: string;
  title: string;
  description?: string;
  scheduledTime: Date;
  frequency: string;
  notificationMethod?: string;
}

export interface UpdateReminderInput {
  type?: string;
  title?: string;
  description?: string;
  scheduledTime?: Date;
  frequency?: string;
  isActive?: boolean;
  notificationMethod?: string;
}

const eventBridgeService = new EventBridgeService();

export class ReminderService {
  async createReminder(userId: string, input: CreateReminderInput) {
    if (input.scheduledTime <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        description: input.description || '',
        scheduledTime: input.scheduledTime,
        frequency: input.frequency,
        isActive: true,
        notificationMethod: input.notificationMethod || 'sms',
      },
    });

    await eventBridgeService.upsertReminderRule(reminder);

    return reminder;
  }

  async getUserReminders(userId: string) {
    return prisma.reminder.findMany({
      where: { userId, isActive: true },
      orderBy: { scheduledTime: 'asc' },
    });
  }

  async getReminderById(userId: string, reminderId: string) {
    const reminder = await prisma.reminder.findFirst({
      where: { id: reminderId, userId },
    });
    if (!reminder) {
      throw new Error('Reminder not found');
    }
    return reminder;
  }

  async updateReminder(userId: string, reminderId: string, input: UpdateReminderInput) {
    const existing = await prisma.reminder.findFirst({ where: { id: reminderId, userId } });
    if (!existing) {
      throw new Error('Reminder not found');
    }

    if (input.scheduledTime && input.scheduledTime <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        ...(input.type !== undefined && { type: input.type }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.scheduledTime !== undefined && { scheduledTime: input.scheduledTime }),
        ...(input.frequency !== undefined && { frequency: input.frequency }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.notificationMethod !== undefined && { notificationMethod: input.notificationMethod }),
      },
    });

    if (input.scheduledTime !== undefined || input.isActive !== undefined || input.frequency !== undefined) {
      await eventBridgeService.upsertReminderRule(reminder);
    }

    return reminder;
  }

  async deleteReminder(userId: string, reminderId: string) {
    const existing = await prisma.reminder.findFirst({ where: { id: reminderId, userId } });
    if (!existing) {
      throw new Error('Reminder not found');
    }
    await eventBridgeService.deleteReminderRule(reminderId);
    return prisma.reminder.delete({ where: { id: reminderId } });
  }
}
