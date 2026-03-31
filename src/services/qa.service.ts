import { prisma } from '../utils/prisma';

export interface CreateQuestionInput {
  title: string;
  body: string;
  category: string;
}

export interface CreateAnswerInput {
  body: string;
}

export class QAService {
  async createQuestion(userId: string, input: CreateQuestionInput) {
    return prisma.question.create({
      data: {
        userId,
        title: input.title,
        body: input.body,
        category: input.category,
      },
    });
  }

  async getQuestions(category?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          user: { select: { id: true, username: true } },
          _count: { select: { answers: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return { questions, total, page, limit };
  }

  async createAnswer(userId: string, questionId: string, input: CreateAnswerInput) {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new Error('Question not found');
    }

    // Check if the user has a verified ExpertProfile
    const expertProfile = await prisma.expertProfile.findUnique({ where: { userId } });
    const isExpert = expertProfile?.isVerified === true;

    return prisma.answer.create({
      data: {
        userId,
        questionId,
        body: input.body,
        isExpert,
      },
    });
  }

  async upvoteAnswer(userId: string, answerId: string) {
    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer) {
      throw new Error('Answer not found');
    }

    const existing = await prisma.upVote.findUnique({
      where: { answerId_userId: { answerId, userId } },
    });
    if (existing) {
      throw new Error('Already upvoted');
    }

    return prisma.upVote.create({
      data: { answerId, userId },
    });
  }

  async removeUpvote(userId: string, answerId: string) {
    const existing = await prisma.upVote.findUnique({
      where: { answerId_userId: { answerId, userId } },
    });
    if (!existing) {
      throw new Error('Upvote not found');
    }

    return prisma.upVote.delete({ where: { id: existing.id } });
  }

  async getQuestionWithAnswers(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: { select: { id: true, username: true } },
        answers: {
          include: {
            user: { select: { id: true, username: true } },
            _count: { select: { upvotes: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!question) {
      throw new Error('Question not found');
    }
    return question;
  }
}
