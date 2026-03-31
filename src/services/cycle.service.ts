import { prisma } from '../utils/prisma';

export interface CreateCycleInput {
  startDate: Date;
  endDate?: Date;
  cycleLength: number;
  periodLength: number;
  notes?: string;
}

export interface UpdateCycleInput {
  startDate?: Date;
  endDate?: Date | null;
  cycleLength?: number;
  periodLength?: number;
  notes?: string;
}

export class CycleService {
  async createCycle(userId: string, input: CreateCycleInput) {
    // Precondition: startDate <= endDate (if endDate provided)
    if (input.endDate && input.startDate > input.endDate) {
      throw new Error('Start date must be before or equal to end date');
    }

    return prisma.cycle.create({
      data: {
        userId,
        startDate: input.startDate,
        endDate: input.endDate,
        cycleLength: input.cycleLength,
        periodLength: input.periodLength,
        notes: input.notes || '',
      },
    });
  }

  async getUserCycles(userId: string) {
    return prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getCycleById(userId: string, cycleId: string) {
    const cycle = await prisma.cycle.findFirst({
      where: { id: cycleId, userId },
      include: { symptoms: true },
    });
    if (!cycle) {
      throw new Error('Cycle not found');
    }
    return cycle;
  }

  async getCurrentCycle(userId: string) {
    const now = new Date();
    return prisma.cycle.findFirst({
      where: {
        userId,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateCycle(userId: string, cycleId: string, input: UpdateCycleInput) {
    const existing = await prisma.cycle.findFirst({ where: { id: cycleId, userId } });
    if (!existing) {
      throw new Error('Cycle not found');
    }

    const startDate = input.startDate ?? existing.startDate;
    const endDate = input.endDate !== undefined ? input.endDate : existing.endDate;

    if (endDate && startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }

    return prisma.cycle.update({
      where: { id: cycleId },
      data: {
        ...(input.startDate !== undefined && { startDate: input.startDate }),
        ...(input.endDate !== undefined && { endDate: input.endDate }),
        ...(input.cycleLength !== undefined && { cycleLength: input.cycleLength }),
        ...(input.periodLength !== undefined && { periodLength: input.periodLength }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
  }

  async deleteCycle(userId: string, cycleId: string) {
    const existing = await prisma.cycle.findFirst({ where: { id: cycleId, userId } });
    if (!existing) {
      throw new Error('Cycle not found');
    }
    return prisma.cycle.delete({ where: { id: cycleId } });
  }
}
