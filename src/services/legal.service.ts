import { prisma } from '../utils/prisma';

export class LegalService {
  async getContent(country: string, category?: string, language?: string) {
    const where: Record<string, unknown> = { country };
    if (category) where.category = category;
    if (language) where.language = language;

    return prisma.legalContent.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async searchContent(query: string, country?: string) {
    const where: Record<string, unknown> = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (country) where.country = country;

    return prisma.legalContent.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getDivorceRules(country: string) {
    return prisma.divorceRule.findMany({
      where: { country },
      orderBy: { ruleType: 'asc' },
    });
  }
}
