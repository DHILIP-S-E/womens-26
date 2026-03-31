import { prisma } from '../utils/prisma';

export interface CreateTrustedContactInput {
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface UpdateTrustedContactInput {
  name?: string;
  phoneNumber?: string;
  email?: string;
  relationship?: string;
  isPrimary?: boolean;
}

export class TrustedContactService {
  async addContact(userId: string, input: CreateTrustedContactInput) {
    const existingCount = await prisma.trustedContact.count({ where: { userId } });
    if (existingCount >= 5) {
      throw new Error('Maximum of 5 trusted contacts allowed');
    }

    // If this contact is marked as primary, unset any existing primary
    if (input.isPrimary) {
      await prisma.trustedContact.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return prisma.trustedContact.create({
      data: {
        userId,
        name: input.name,
        phoneNumber: input.phoneNumber,
        email: input.email,
        relationship: input.relationship,
        isPrimary: input.isPrimary ?? false,
      },
    });
  }

  async getContacts(userId: string) {
    return prisma.trustedContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateContact(userId: string, contactId: string, input: UpdateTrustedContactInput) {
    const existing = await prisma.trustedContact.findFirst({
      where: { id: contactId, userId },
    });
    if (!existing) {
      throw new Error('Trusted contact not found');
    }

    // If setting as primary, unset any existing primary
    if (input.isPrimary) {
      await prisma.trustedContact.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return prisma.trustedContact.update({
      where: { id: contactId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.relationship !== undefined && { relationship: input.relationship }),
        ...(input.isPrimary !== undefined && { isPrimary: input.isPrimary }),
      },
    });
  }

  async deleteContact(userId: string, contactId: string) {
    const existing = await prisma.trustedContact.findFirst({
      where: { id: contactId, userId },
    });
    if (!existing) {
      throw new Error('Trusted contact not found');
    }
    return prisma.trustedContact.delete({ where: { id: contactId } });
  }
}
