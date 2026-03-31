import { prisma } from '../utils/prisma';

export class CrisisService {
  async analyzeText(text: string) {
    const keywords = await prisma.crisisKeyword.findMany();

    const lowerText = text.toLowerCase();
    const matched = keywords.filter((kw) => lowerText.includes(kw.keyword.toLowerCase()));

    if (matched.length === 0) {
      return { isCrisis: false, severity: 0, resources: [] };
    }

    const severity = Math.max(...matched.map((kw) => kw.severity));

    // If severity >= 2, fetch resource pathways
    let resources: Awaited<ReturnType<typeof prisma.resourcePathway.findMany>> = [];
    if (severity >= 2) {
      resources = await prisma.resourcePathway.findMany({
        where: { type: 'crisis_line', isActive: true },
        take: 10,
      });
    }

    return { isCrisis: true, severity, resources };
  }

  async getResourcesByCountry(country: string) {
    return prisma.resourcePathway.findMany({
      where: { country, isActive: true },
      orderBy: { type: 'asc' },
    });
  }

  async getCrisisNumbers(country: string) {
    return prisma.contentBlock.findMany({
      where: {
        category: 'crisis_line',
        country,
        isActive: true,
      },
    });
  }
}
