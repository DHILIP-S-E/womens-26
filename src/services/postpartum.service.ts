import { prisma } from '../utils/prisma';

export interface LogFeedingInput {
  startTime: Date;
  endTime?: Date;
  type: string;
  duration?: number;
  latchRating?: number;
  notes?: string;
}

export interface FeedingFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface LogBabySleepInput {
  startTime: Date;
  endTime?: Date;
  quality?: number;
  notes?: string;
}

export interface BabySleepFilter {
  startDate?: Date;
  endDate?: Date;
}

export class PostpartumService {
  async submitEPDS(userId: string, answers: number[]) {
    if (!Array.isArray(answers) || answers.length !== 10) {
      throw new Error('EPDS requires exactly 10 answers');
    }

    for (const answer of answers) {
      if (typeof answer !== 'number' || answer < 0 || answer > 3) {
        throw new Error('Each EPDS answer must be a number between 0 and 3');
      }
    }

    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    const flagged = totalScore >= 10;

    return prisma.ePDSAssessment.create({
      data: {
        userId,
        answers,
        totalScore,
        flagged,
      },
    });
  }

  async getEPDSHistory(userId: string) {
    return prisma.ePDSAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async logFeeding(userId: string, input: LogFeedingInput) {
    return prisma.feedingLog.create({
      data: {
        userId,
        startTime: input.startTime,
        endTime: input.endTime,
        type: input.type,
        duration: input.duration,
        latchRating: input.latchRating,
        notes: input.notes || '',
      },
    });
  }

  async getFeedingLogs(userId: string, filter?: FeedingFilter) {
    const where: any = { userId };

    if (filter?.startDate || filter?.endDate) {
      where.startTime = {};
      if (filter.startDate) where.startTime.gte = filter.startDate;
      if (filter.endDate) where.startTime.lte = filter.endDate;
    }

    return prisma.feedingLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
    });
  }

  async logBabySleep(userId: string, input: LogBabySleepInput) {
    return prisma.babySleepLog.create({
      data: {
        userId,
        startTime: input.startTime,
        endTime: input.endTime,
        quality: input.quality,
        notes: input.notes || '',
      },
    });
  }

  async getBabySleepLogs(userId: string, filter?: BabySleepFilter) {
    const where: any = { userId };

    if (filter?.startDate || filter?.endDate) {
      where.startTime = {};
      if (filter.startDate) where.startTime.gte = filter.startDate;
      if (filter.endDate) where.startTime.lte = filter.endDate;
    }

    return prisma.babySleepLog.findMany({
      where,
      orderBy: { startTime: 'desc' },
    });
  }
}
