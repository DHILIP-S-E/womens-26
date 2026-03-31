import { prisma } from '../utils/prisma';

export interface LogFertilityInput {
  date: Date;
  bbt?: number;
  ovulationTest?: string;
  cervicalMucus?: string;
  intercourse?: boolean;
  notes?: string;
}

export interface FertilityFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface CreateIVFCycleInput {
  cycleNumber: number;
  stage: string;
  startDate: Date;
  medications?: any;
  notes?: string;
}

export interface UpdateIVFStageInput {
  stage: string;
  outcome?: string;
  endDate?: Date;
  notes?: string;
}

const IVF_STAGE_ORDER = [
  'stimulation',
  'retrieval',
  'fertilisation',
  'transfer',
  'wait',
  'result',
];

export class FertilityService {
  async logFertility(userId: string, input: LogFertilityInput) {
    if (input.bbt !== undefined && (input.bbt < 35.0 || input.bbt > 42.0)) {
      throw new Error('BBT must be between 35.0 and 42.0°C');
    }

    return prisma.fertilityLog.create({
      data: {
        userId,
        date: input.date,
        bbt: input.bbt,
        ovulationTest: input.ovulationTest,
        cervicalMucus: input.cervicalMucus,
        intercourse: input.intercourse ?? false,
        notes: input.notes || '',
      },
    });
  }

  async getUserFertilityLogs(userId: string, filter?: FertilityFilter) {
    const where: any = { userId };

    if (filter?.startDate || filter?.endDate) {
      where.date = {};
      if (filter.startDate) where.date.gte = filter.startDate;
      if (filter.endDate) where.date.lte = filter.endDate;
    }

    return prisma.fertilityLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async createIVFCycle(userId: string, input: CreateIVFCycleInput) {
    return prisma.iVFCycle.create({
      data: {
        userId,
        cycleNumber: input.cycleNumber,
        stage: input.stage,
        startDate: input.startDate,
        medications: input.medications ?? undefined,
        notes: input.notes || '',
      },
    });
  }

  async updateIVFStage(userId: string, cycleId: string, input: UpdateIVFStageInput) {
    const existing = await prisma.iVFCycle.findFirst({
      where: { id: cycleId, userId },
    });

    if (!existing) {
      throw new Error('IVF cycle not found');
    }

    // Validate stage sequence
    const currentIndex = IVF_STAGE_ORDER.indexOf(existing.stage);
    const newIndex = IVF_STAGE_ORDER.indexOf(input.stage);

    if (currentIndex === -1 || newIndex === -1) {
      throw new Error('Invalid IVF stage');
    }

    if (newIndex < currentIndex) {
      throw new Error(
        `Cannot move from stage "${existing.stage}" to "${input.stage}". Stages must progress forward.`
      );
    }

    return prisma.iVFCycle.update({
      where: { id: cycleId },
      data: {
        stage: input.stage,
        ...(input.outcome !== undefined && { outcome: input.outcome }),
        ...(input.endDate !== undefined && { endDate: input.endDate }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
  }

  async getUserIVFCycles(userId: string) {
    return prisma.iVFCycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }
}
