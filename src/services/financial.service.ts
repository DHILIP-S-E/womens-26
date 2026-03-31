import { prisma } from '../utils/prisma';

export interface CreateGoalInput {
  title: string;
  targetAmount: number;
  currency?: string;
  deadline?: Date;
}

export interface UpdateGoalInput {
  currentAmount?: number;
  status?: string;
  title?: string;
  targetAmount?: number;
  deadline?: Date;
}

export class FinancialService {
  async createGoal(userId: string, input: CreateGoalInput) {
    if (input.targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0');
    }

    return prisma.financialGoal.create({
      data: {
        userId,
        title: input.title,
        targetAmount: input.targetAmount,
        currency: input.currency || 'INR',
        deadline: input.deadline || null,
      },
    });
  }

  async updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
    const existing = await prisma.financialGoal.findFirst({ where: { id: goalId, userId } });
    if (!existing) {
      throw new Error('Financial goal not found');
    }

    return prisma.financialGoal.update({
      where: { id: goalId },
      data: {
        ...(input.currentAmount !== undefined && { currentAmount: input.currentAmount }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.title !== undefined && { title: input.title }),
        ...(input.targetAmount !== undefined && { targetAmount: input.targetAmount }),
        ...(input.deadline !== undefined && { deadline: input.deadline }),
      },
    });
  }

  async getGoals(userId: string) {
    return prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    const existing = await prisma.financialGoal.findFirst({ where: { id: goalId, userId } });
    if (!existing) {
      throw new Error('Financial goal not found');
    }

    return prisma.financialGoal.delete({ where: { id: goalId } });
  }
}
