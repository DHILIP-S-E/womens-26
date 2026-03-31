import { prisma } from '../utils/prisma';
import { ComprehendMedicalService } from './comprehend-medical.service';

export interface CreateSymptomInput {
  date: Date;
  type: string;
  severity: number;
  cycleId?: string;
  notes?: string;
}

export interface UpdateSymptomInput {
  date?: Date;
  type?: string;
  severity?: number;
  cycleId?: string | null;
  notes?: string;
}

export interface SymptomFilter {
  startDate?: Date;
  endDate?: Date;
}

export class SymptomService {
  private comprehendService = new ComprehendMedicalService();

  async logSymptom(userId: string, input: CreateSymptomInput) {
    // Precondition: severity in 1-10
    if (input.severity < 1 || input.severity > 10) {
      throw new Error('Severity must be between 1 and 10');
    }

    const symptom = await prisma.symptom.create({
      data: {
        userId,
        date: input.date,
        type: input.type,
        severity: input.severity,
        cycleId: input.cycleId,
        notes: input.notes || '',
      },
    });

    if (symptom.notes.trim().length > 2) {
      this.triggerBackgroundAnalysis(symptom.id, symptom.notes);
    }

    return symptom;
  }

  async getUserSymptoms(userId: string, filter?: SymptomFilter) {
    const where: Record<string, unknown> = { userId };

    if (filter?.startDate || filter?.endDate) {
      where.date = {};
      if (filter.startDate) {
        (where.date as Record<string, unknown>).gte = filter.startDate;
      }
      if (filter.endDate) {
        (where.date as Record<string, unknown>).lte = filter.endDate;
      }
    }

    return prisma.symptom.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getSymptomById(userId: string, symptomId: string) {
    const symptom = await prisma.symptom.findFirst({
      where: { id: symptomId, userId },
    });
    if (!symptom) {
      throw new Error('Symptom not found');
    }
    return symptom;
  }

  async updateSymptom(userId: string, symptomId: string, input: UpdateSymptomInput) {
    const existing = await prisma.symptom.findFirst({ where: { id: symptomId, userId } });
    if (!existing) {
      throw new Error('Symptom not found');
    }

    if (input.severity !== undefined && (input.severity < 1 || input.severity > 10)) {
      throw new Error('Severity must be between 1 and 10');
    }

    return prisma.symptom.update({
      where: { id: symptomId },
      data: {
        ...(input.date !== undefined && { date: input.date }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.severity !== undefined && { severity: input.severity }),
        ...(input.cycleId !== undefined && { cycleId: input.cycleId }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
  }

  async deleteSymptom(userId: string, symptomId: string) {
    const existing = await prisma.symptom.findFirst({ where: { id: symptomId, userId } });
    if (!existing) {
      throw new Error('Symptom not found');
    }
    return prisma.symptom.delete({ where: { id: symptomId } });
  }

  async analyzeSymptom(userId: string, symptomId: string) {
    const symptom = await prisma.symptom.findFirst({ where: { id: symptomId, userId } });
    if (!symptom) throw new Error('Symptom not found');

    if (symptom.notes.trim().length <= 2) return symptom;

    const insights = await this.comprehendService.analyzeText(symptom.notes);
    if (!insights) return symptom;

    return prisma.symptom.update({
      where: { id: symptomId },
      data: { medicalInsights: insights as object },
    });
  }

  private triggerBackgroundAnalysis(symptomId: string, notes: string): void {
    this.comprehendService
      .analyzeText(notes)
      .then((insights) => {
        if (!insights) return;
        return prisma.symptom.update({
          where: { id: symptomId },
          data: { medicalInsights: insights as object },
        });
      })
      .catch((err) => {
        console.error(`Background Comprehend analysis failed for symptom ${symptomId}:`, err);
      });
  }
}
