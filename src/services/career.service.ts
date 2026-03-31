import { prisma } from '../utils/prisma';

export interface CreateMilestoneInput {
  type: string;
  title: string;
  company?: string;
  salary?: number;
  date: Date;
  notes?: string;
}

export class CareerService {
  async getSalaryBenchmarks(country: string, role?: string, experienceLevel?: string) {
    const where: Record<string, unknown> = { country };
    if (role) where.role = { contains: role, mode: 'insensitive' };
    if (experienceLevel) where.experienceLevel = experienceLevel;

    return prisma.salaryBenchmark.findMany({
      where,
      orderBy: { role: 'asc' },
    });
  }

  async addMilestone(userId: string, input: CreateMilestoneInput) {
    return prisma.careerMilestone.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        company: input.company || null,
        salary: input.salary || null,
        date: input.date,
        notes: input.notes || '',
      },
    });
  }

  async getMilestones(userId: string) {
    return prisma.careerMilestone.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async getContentByCategory(category: string, country?: string) {
    const where: Record<string, unknown> = { category, isActive: true };
    if (country) where.country = country;

    return prisma.contentBlock.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
