import { prisma } from '../utils/prisma';

export interface LogWeekInput {
  week: number;
  weight?: number;
  bloodPressure?: string;
  symptoms?: string[];
  notes?: string;
}

export interface LogContractionInput {
  startTime: Date;
  endTime: Date;
  intensity: number;
}

export interface LogKickInput {
  week: number;
  count: number;
  duration: number;
  startTime: Date;
}

export class PregnancyService {
  async logWeek(userId: string, input: LogWeekInput) {
    if (input.week < 1 || input.week > 42) {
      throw new Error('Pregnancy week must be between 1 and 42');
    }

    return prisma.pregnancyLog.create({
      data: {
        userId,
        week: input.week,
        weight: input.weight,
        bloodPressure: input.bloodPressure,
        symptoms: input.symptoms ?? [],
        notes: input.notes || '',
      },
    });
  }

  async getUserPregnancyLogs(userId: string) {
    return prisma.pregnancyLog.findMany({
      where: { userId },
      orderBy: { week: 'desc' },
    });
  }

  async createBirthPlan(userId: string, preferences: any) {
    return prisma.birthPlan.create({
      data: {
        userId,
        preferences,
      },
    });
  }

  async logContraction(userId: string, input: LogContractionInput) {
    return prisma.contractionLog.create({
      data: {
        userId,
        startTime: input.startTime,
        endTime: input.endTime,
        intensity: input.intensity,
      },
    });
  }

  async getContractions(userId: string, last24h: boolean) {
    const where: any = { userId };

    if (last24h) {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      where.startTime = { gte: cutoff };
    }

    return prisma.contractionLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
    });
  }

  async logKick(userId: string, input: LogKickInput) {
    return prisma.kickLog.create({
      data: {
        userId,
        week: input.week,
        count: input.count,
        duration: input.duration,
        startTime: input.startTime,
      },
    });
  }

  async getKickLogs(userId: string, week?: number) {
    const where: any = { userId };
    if (week !== undefined) {
      where.week = week;
    }

    return prisma.kickLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
    });
  }
}
