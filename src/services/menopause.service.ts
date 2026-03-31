import { prisma } from '../utils/prisma';

export interface LogHotFlashInput {
  date: Date;
  duration: number;
  severity: number;
  trigger?: string;
  notes?: string;
}

export interface HotFlashFilter {
  startDate?: Date;
  endDate?: Date;
}

export class MenopauseService {
  async logHotFlash(userId: string, input: LogHotFlashInput) {
    if (input.severity < 1 || input.severity > 10) {
      throw new Error('Severity must be between 1 and 10');
    }

    return prisma.hotFlashLog.create({
      data: {
        userId,
        date: input.date,
        duration: input.duration,
        severity: input.severity,
        trigger: input.trigger,
        notes: input.notes || '',
      },
    });
  }

  async getHotFlashLogs(userId: string, filter?: HotFlashFilter) {
    const where: any = { userId };

    if (filter?.startDate || filter?.endDate) {
      where.date = {};
      if (filter.startDate) where.date.gte = filter.startDate;
      if (filter.endDate) where.date.lte = filter.endDate;
    }

    return prisma.hotFlashLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getHotFlashStats(userId: string) {
    const logs = await prisma.hotFlashLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    if (logs.length === 0) {
      return {
        totalLogs: 0,
        avgSeverity: 0,
        frequencyPerWeek: 0,
        commonTriggers: [],
      };
    }

    // Average severity
    const avgSeverity =
      logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;

    // Frequency per week: calculate span in weeks between first and last log
    const earliest = logs[logs.length - 1].date;
    const latest = logs[0].date;
    const spanMs = latest.getTime() - earliest.getTime();
    const spanWeeks = Math.max(spanMs / (7 * 24 * 60 * 60 * 1000), 1);
    const frequencyPerWeek = logs.length / spanWeeks;

    // Common triggers
    const triggerCounts: Record<string, number> = {};
    for (const log of logs) {
      if (log.trigger) {
        triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
      }
    }

    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([trigger, count]) => ({ trigger, count }));

    return {
      totalLogs: logs.length,
      avgSeverity: Math.round(avgSeverity * 100) / 100,
      frequencyPerWeek: Math.round(frequencyPerWeek * 100) / 100,
      commonTriggers,
    };
  }
}
