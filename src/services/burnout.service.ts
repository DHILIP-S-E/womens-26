import { prisma } from '../utils/prisma';

// Burnout assessment: answers is an array of scores.
// We split into 3 subscales and calculate totals.
// Subscale mapping (based on MBI-like structure):
//   Exhaustion: items 0-4, Cynicism: items 5-8, Efficacy: items 9-14
const EXHAUSTION_ITEMS = [0, 1, 2, 3, 4];
const CYNICISM_ITEMS = [5, 6, 7, 8];
const EFFICACY_ITEMS = [9, 10, 11, 12, 13, 14];
const FLAGGED_THRESHOLD = 50;

export class BurnoutService {
  async submitAssessment(userId: string, answers: number[]) {
    const exhaustion = EXHAUSTION_ITEMS.reduce((sum, i) => sum + (answers[i] || 0), 0);
    const cynicism = CYNICISM_ITEMS.reduce((sum, i) => sum + (answers[i] || 0), 0);
    const efficacy = EFFICACY_ITEMS.reduce((sum, i) => sum + (answers[i] || 0), 0);
    const totalScore = answers.reduce((sum, v) => sum + (v || 0), 0);
    const flagged = totalScore >= FLAGGED_THRESHOLD;

    return prisma.burnoutAssessment.create({
      data: {
        userId,
        answers: answers as unknown as object,
        totalScore,
        exhaustion,
        cynicism,
        efficacy,
        flagged,
      },
    });
  }

  async getHistory(userId: string) {
    return prisma.burnoutAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
