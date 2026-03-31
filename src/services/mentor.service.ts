import { prisma } from '../utils/prisma';

export interface CreateMentorProfileInput {
  bio: string;
  isAnonymous?: boolean;
  tagIds: string[];
}

export class MentorService {
  async createProfile(userId: string, input: CreateMentorProfileInput) {
    const existing = await prisma.mentorProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new Error('Mentor profile already exists');
    }

    return prisma.mentorProfile.create({
      data: {
        userId,
        bio: input.bio,
        isAnonymous: input.isAnonymous || false,
        tags: {
          create: input.tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async findMentors(tagIds: string[]) {
    if (!tagIds.length) {
      return prisma.mentorProfile.findMany({
        where: { isActive: true },
        include: { tags: { include: { tag: true } } },
      });
    }

    return prisma.mentorProfile.findMany({
      where: {
        isActive: true,
        tags: {
          some: { tagId: { in: tagIds } },
        },
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async requestMatch(menteeId: string, mentorId: string) {
    // Ensure both have mentor profiles
    const menteeProfile = await prisma.mentorProfile.findUnique({ where: { userId: menteeId } });
    if (!menteeProfile) {
      throw new Error('You must create a mentor profile first');
    }

    const mentorProfile = await prisma.mentorProfile.findFirst({
      where: { id: mentorId, isActive: true },
    });
    if (!mentorProfile) {
      throw new Error('Mentor not found');
    }

    if (mentorProfile.userId === menteeId) {
      throw new Error('Cannot match with yourself');
    }

    return prisma.mentorMatch.create({
      data: {
        mentorId: mentorProfile.id,
        menteeId: menteeProfile.id,
        status: 'pending',
      },
    });
  }

  async respondToMatch(userId: string, matchId: string, accept: boolean) {
    const match = await prisma.mentorMatch.findFirst({
      where: { id: matchId },
      include: { mentor: true },
    });
    if (!match) {
      throw new Error('Match not found');
    }
    if (match.mentor.userId !== userId) {
      throw new Error('Only the mentor can respond to match requests');
    }
    if (match.status !== 'pending') {
      throw new Error('Match has already been responded to');
    }

    return prisma.mentorMatch.update({
      where: { id: matchId },
      data: { status: accept ? 'accepted' : 'declined' },
    });
  }

  async getMatches(userId: string) {
    const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return [];
    }

    return prisma.mentorMatch.findMany({
      where: {
        OR: [{ mentorId: profile.id }, { menteeId: profile.id }],
      },
      include: {
        mentor: { include: { tags: { include: { tag: true } } } },
        mentee: { include: { tags: { include: { tag: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendMessage(userId: string, matchId: string, content: string) {
    const profile = await prisma.mentorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error('Mentor profile not found');
    }

    const match = await prisma.mentorMatch.findFirst({
      where: {
        id: matchId,
        status: 'accepted',
        OR: [{ mentorId: profile.id }, { menteeId: profile.id }],
      },
    });
    if (!match) {
      throw new Error('Match not found or not accepted');
    }

    return prisma.mentorMessage.create({
      data: {
        matchId,
        senderId: userId,
        content,
      },
    });
  }

  async getMessages(matchId: string) {
    return prisma.mentorMessage.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
