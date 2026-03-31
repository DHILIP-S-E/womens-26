import { randomUUID } from 'crypto';
import { prisma } from '../utils/prisma';
import { SOSService } from './sos.service';

export interface StartSafeWalkInput {
  startLat: number;
  startLng: number;
  destLat: number;
  destLng: number;
  expectedArrival: Date;
}

export class SafeWalkService {
  async startSession(userId: string, input: StartSafeWalkInput) {
    // Check if user already has an active session
    const activeSession = await prisma.safeWalkSession.findFirst({
      where: { userId, status: 'active' },
    });
    if (activeSession) {
      throw new Error('You already have an active safe walk session');
    }

    const shareToken = randomUUID();

    return prisma.safeWalkSession.create({
      data: {
        userId,
        startLatitude: input.startLat,
        startLongitude: input.startLng,
        destLatitude: input.destLat,
        destLongitude: input.destLng,
        expectedArrival: input.expectedArrival,
        status: 'active',
        shareToken,
        lastLatitude: input.startLat,
        lastLongitude: input.startLng,
        lastUpdatedAt: new Date(),
      },
    });
  }

  async updateLocation(userId: string, sessionId: string, input: { latitude: number; longitude: number }) {
    const session = await prisma.safeWalkSession.findFirst({
      where: { id: sessionId, userId, status: 'active' },
    });
    if (!session) {
      throw new Error('Active safe walk session not found');
    }

    return prisma.safeWalkSession.update({
      where: { id: sessionId },
      data: {
        lastLatitude: input.latitude,
        lastLongitude: input.longitude,
        lastUpdatedAt: new Date(),
      },
    });
  }

  async completeSession(userId: string, sessionId: string) {
    const session = await prisma.safeWalkSession.findFirst({
      where: { id: sessionId, userId, status: 'active' },
    });
    if (!session) {
      throw new Error('Active safe walk session not found');
    }

    return prisma.safeWalkSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }

  async getActiveSession(userId: string) {
    return prisma.safeWalkSession.findFirst({
      where: { userId, status: 'active' },
    });
  }

  async getPublicSession(shareToken: string) {
    const session = await prisma.safeWalkSession.findUnique({
      where: { shareToken },
      select: {
        id: true,
        startLatitude: true,
        startLongitude: true,
        destLatitude: true,
        destLongitude: true,
        expectedArrival: true,
        status: true,
        lastLatitude: true,
        lastLongitude: true,
        lastUpdatedAt: true,
        completedAt: true,
        createdAt: true,
      },
    });
    if (!session) {
      throw new Error('Safe walk session not found');
    }
    return session;
  }

  static async checkExpiredSessions() {
    const now = new Date();
    const expiredSessions = await prisma.safeWalkSession.findMany({
      where: {
        status: 'active',
        expectedArrival: { lt: now },
      },
    });

    const sosService = new SOSService();

    for (const session of expiredSessions) {
      try {
        // Trigger SOS using the last known location
        await sosService.triggerSOS(session.userId, {
          latitude: session.lastLatitude ?? session.startLatitude,
          longitude: session.lastLongitude ?? session.startLongitude,
        });

        // Mark session as sos_triggered
        await prisma.safeWalkSession.update({
          where: { id: session.id },
          data: { status: 'sos_triggered' },
        });

        console.log(`SOS triggered for expired safe walk session ${session.id}`);
      } catch (error) {
        console.error(`Failed to trigger SOS for session ${session.id}:`, error);
      }
    }

    return expiredSessions.length;
  }
}
