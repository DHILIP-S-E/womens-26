import { prisma } from '../utils/prisma';

export interface ResourceSearchInput {
  country?: string;
  type?: string;
  city?: string;
}

export class ResourceLocationService {
  async search(filters: ResourceSearchInput) {
    const where: Record<string, unknown> = { isActive: true };
    if (filters.country) where.country = filters.country;
    if (filters.type) where.type = filters.type;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

    return prisma.resourceLocation.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getNearby(lat: number, lng: number, radiusKm: number, type?: string) {
    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;

    const locations = await prisma.resourceLocation.findMany({ where });

    // Filter by Haversine distance and sort by distance
    const withDistance = locations
      .map((loc) => ({
        ...loc,
        distance: this.haversineDistance(lat, lng, loc.latitude, loc.longitude),
      }))
      .filter((loc) => loc.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return withDistance;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
