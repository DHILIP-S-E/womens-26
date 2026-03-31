import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../utils/prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ChatContext {
  recentMoods: Array<{ mood: string; intensity: number; date: Date }>;
  recentSymptoms: Array<{ type: string; severity: number; date: Date }>;
  currentCycle: { startDate: Date; endDate: Date | null; cycleLength: number } | null;
}

export interface ChatResponse {
  response: string;
  context: ChatContext;
}

export class AIChatService {
  async chat(userId: string, message: string): Promise<ChatResponse> {
    // Build context from user's recent health data
    const context = await this.buildContext(userId);

    // Build system prompt with health context
    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: message },
      ]);

      const response = result.response.text();

      if (!response) {
        throw new Error('AI returned empty response');
      }

      // Save chat history
      await prisma.chatHistory.create({
        data: {
          userId,
          message,
          response,
          context: JSON.parse(JSON.stringify(context)),
        },
      });

      return { response, context };
    } catch (error) {
      console.error('AI Chat error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async buildContext(userId: string): Promise<ChatContext> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentMoods, recentSymptoms, currentCycle] = await Promise.all([
      prisma.mood.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
        select: { mood: true, intensity: true, date: true },
        take: 10,
      }),
      prisma.symptom.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
        select: { type: true, severity: true, date: true },
        take: 10,
      }),
      prisma.cycle.findFirst({
        where: {
          userId,
          startDate: { lte: new Date() },
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        select: { startDate: true, endDate: true, cycleLength: true },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    return { recentMoods, recentSymptoms, currentCycle };
  }

  async getChatHistory(userId: string, limit: number = 20) {
    return prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private buildSystemPrompt(context: ChatContext): string {
    let prompt = `You are a caring and knowledgeable women's health assistant. Provide helpful, empathetic, and evidence-based health information. Always recommend consulting a healthcare provider for medical decisions.\n\n`;

    prompt += `Here is the user's recent health context:\n\n`;

    if (context.currentCycle) {
      prompt += `Current Cycle: Started ${context.currentCycle.startDate.toISOString().split('T')[0]}, `;
      prompt += context.currentCycle.endDate
        ? `ends ${context.currentCycle.endDate.toISOString().split('T')[0]}`
        : 'ongoing';
      prompt += `, cycle length: ${context.currentCycle.cycleLength} days\n`;
    }

    if (context.recentMoods.length > 0) {
      prompt += `\nRecent Moods (last 7 days):\n`;
      for (const mood of context.recentMoods) {
        prompt += `- ${mood.mood} (intensity: ${mood.intensity}/10) on ${mood.date.toISOString().split('T')[0]}\n`;
      }
    }

    if (context.recentSymptoms.length > 0) {
      prompt += `\nRecent Symptoms (last 7 days):\n`;
      for (const symptom of context.recentSymptoms) {
        prompt += `- ${symptom.type} (severity: ${symptom.severity}/10) on ${symptom.date.toISOString().split('T')[0]}\n`;
      }
    }

    return prompt;
  }
}
