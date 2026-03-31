import { prisma } from '../utils/prisma';
import { MOOD_TYPES } from '../utils/validation';
import { ComprehendMedicalService } from './comprehend-medical.service';

export interface CreateMoodInput {
  date: Date;
  mood: string;
  intensity: number;
  triggers?: string[];
  notes?: string;
}

export interface UpdateMoodInput {
  date?: Date;
  mood?: string;
  intensity?: number;
  triggers?: string[];
  notes?: string;
}

export interface MoodFilter {
  startDate?: Date;
  endDate?: Date;
}

const VALID_MOOD_TYPES = new Set<string>(MOOD_TYPES);

export class MoodService {
  private comprehendService = new ComprehendMedicalService();

  async logMood(userId: string, input: CreateMoodInput) {
    // Precondition: intensity in 1-10
    if (input.intensity < 1 || input.intensity > 10) {
      throw new Error('Intensity must be between 1 and 10');
    }

    // Precondition: mood type is valid
    if (!VALID_MOOD_TYPES.has(input.mood)) {
      throw new Error(`Invalid mood type: ${input.mood}`);
    }

    const mood = await prisma.mood.create({
      data: {
        userId,
        date: input.date,
        mood: input.mood,
        intensity: input.intensity,
        triggers: input.triggers || [],
        notes: input.notes || '',
      },
    });

    const combinedText = this.buildMoodText(mood.mood, mood.triggers, mood.notes);
    if (combinedText.trim().length > 2) {
      this.triggerBackgroundAnalysis(mood.id, combinedText);
    }

    return mood;
  }

  async getUserMoods(userId: string, filter?: MoodFilter) {
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

    return prisma.mood.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getMoodById(userId: string, moodId: string) {
    const mood = await prisma.mood.findFirst({
      where: { id: moodId, userId },
    });
    if (!mood) {
      throw new Error('Mood not found');
    }
    return mood;
  }

  async updateMood(userId: string, moodId: string, input: UpdateMoodInput) {
    const existing = await prisma.mood.findFirst({ where: { id: moodId, userId } });
    if (!existing) {
      throw new Error('Mood not found');
    }

    if (input.intensity !== undefined && (input.intensity < 1 || input.intensity > 10)) {
      throw new Error('Intensity must be between 1 and 10');
    }

    if (input.mood !== undefined && !VALID_MOOD_TYPES.has(input.mood)) {
      throw new Error(`Invalid mood type: ${input.mood}`);
    }

    return prisma.mood.update({
      where: { id: moodId },
      data: {
        ...(input.date !== undefined && { date: input.date }),
        ...(input.mood !== undefined && { mood: input.mood }),
        ...(input.intensity !== undefined && { intensity: input.intensity }),
        ...(input.triggers !== undefined && { triggers: input.triggers }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
  }

  async deleteMood(userId: string, moodId: string) {
    const existing = await prisma.mood.findFirst({ where: { id: moodId, userId } });
    if (!existing) {
      throw new Error('Mood not found');
    }
    return prisma.mood.delete({ where: { id: moodId } });
  }

  async analyzeMood(userId: string, moodId: string) {
    const mood = await prisma.mood.findFirst({ where: { id: moodId, userId } });
    if (!mood) throw new Error('Mood not found');

    const combinedText = this.buildMoodText(mood.mood, mood.triggers, mood.notes);
    if (combinedText.trim().length <= 2) return mood;

    const insights = await this.comprehendService.analyzeText(combinedText);
    if (!insights) return mood;

    return prisma.mood.update({
      where: { id: moodId },
      data: { medicalInsights: insights as object },
    });
  }

  private buildMoodText(mood: string, triggers: string[], notes: string): string {
    const parts: string[] = [];
    if (mood) parts.push(`Mood: ${mood}`);
    if (triggers.length > 0) parts.push(`Triggers: ${triggers.join(', ')}`);
    if (notes.trim().length > 0) parts.push(notes);
    return parts.join('. ');
  }

  private triggerBackgroundAnalysis(moodId: string, text: string): void {
    this.comprehendService
      .analyzeText(text)
      .then((insights) => {
        if (!insights) return;
        return prisma.mood.update({
          where: { id: moodId },
          data: { medicalInsights: insights as object },
        });
      })
      .catch((err) => {
        console.error(`Background Comprehend analysis failed for mood ${moodId}:`, err);
      });
  }
}
