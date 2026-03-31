import { prisma } from '../utils/prisma';

export interface CreateGriefEntryInput {
  date: Date;
  stage?: string;
  content: string;
}

export class GriefService {
  /**
   * Create a grief journal entry. Always private — these entries must
   * NEVER appear in any export or AI context.
   */
  async createEntry(userId: string, input: CreateGriefEntryInput) {
    return prisma.griefJournal.create({
      data: {
        userId,
        date: input.date,
        stage: input.stage,
        content: input.content,
        isPrivate: true, // ALWAYS true
      },
    });
  }

  /**
   * Get only the requesting user's own entries.
   */
  async getEntries(userId: string) {
    return prisma.griefJournal.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Delete a grief journal entry — only if owned by the user.
   */
  async deleteEntry(userId: string, entryId: string) {
    const existing = await prisma.griefJournal.findFirst({
      where: { id: entryId, userId },
    });

    if (!existing) {
      throw new Error('Grief journal entry not found');
    }

    return prisma.griefJournal.delete({ where: { id: entryId } });
  }
}
