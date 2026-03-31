import { prisma } from '../utils/prisma';

export interface TherapistSearchInput {
  country?: string;
  speciality?: string;
  language?: string;
  isOnline?: boolean;
  costRange?: string;
}

export class TherapistService {
  async search(filters: TherapistSearchInput) {
    const where: Record<string, unknown> = {};

    if (filters.country) where.country = filters.country;
    if (filters.speciality) where.speciality = filters.speciality;
    if (filters.isOnline !== undefined) where.isOnline = filters.isOnline;
    if (filters.costRange) where.costRange = filters.costRange;
    if (filters.language) {
      where.languages = { has: filters.language };
    }

    return prisma.therapistProfile.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async addFavourite(userId: string, therapistId: string) {
    const therapist = await prisma.therapistProfile.findUnique({ where: { id: therapistId } });
    if (!therapist) {
      throw new Error('Therapist not found');
    }

    return prisma.userFavouriteTherapist.create({
      data: { userId, therapistId },
    });
  }

  async removeFavourite(userId: string, therapistId: string) {
    const existing = await prisma.userFavouriteTherapist.findUnique({
      where: { userId_therapistId: { userId, therapistId } },
    });
    if (!existing) {
      throw new Error('Favourite not found');
    }

    return prisma.userFavouriteTherapist.delete({
      where: { id: existing.id },
    });
  }

  async getFavourites(userId: string) {
    return prisma.userFavouriteTherapist.findMany({
      where: { userId },
      include: { therapist: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
