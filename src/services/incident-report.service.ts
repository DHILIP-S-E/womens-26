import { prisma } from '../utils/prisma';

export interface CreateIncidentReportInput {
  latitude: number;
  longitude: number;
  type: string;
  severity: number;
  description?: string;
}

export class IncidentReportService {
  async createReport(input: CreateIncidentReportInput) {
    return prisma.incidentReport.create({
      data: {
        latitude: input.latitude,
        longitude: input.longitude,
        type: input.type,
        severity: input.severity,
        description: input.description || '',
      },
    });
  }

  async getHeatmapData() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const reports = await prisma.incidentReport.findMany({
      where: {
        createdAt: { gte: ninetyDaysAgo },
      },
      select: {
        latitude: true,
        longitude: true,
        type: true,
        severity: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group reports by area (rounded to ~1km grid cells)
    const areaMap = new Map<string, { latitude: number; longitude: number; count: number; avgSeverity: number; types: string[] }>();

    for (const report of reports) {
      // Round to 2 decimal places (~1.1km grid)
      const key = `${report.latitude.toFixed(2)},${report.longitude.toFixed(2)}`;
      const existing = areaMap.get(key);

      if (existing) {
        existing.count++;
        existing.avgSeverity = (existing.avgSeverity * (existing.count - 1) + report.severity) / existing.count;
        if (!existing.types.includes(report.type)) {
          existing.types.push(report.type);
        }
      } else {
        areaMap.set(key, {
          latitude: parseFloat(report.latitude.toFixed(2)),
          longitude: parseFloat(report.longitude.toFixed(2)),
          count: 1,
          avgSeverity: report.severity,
          types: [report.type],
        });
      }
    }

    return Array.from(areaMap.values());
  }

  async getNearbyIncidents(lat: number, lng: number, radiusKm: number) {
    // Use Haversine-based bounding box for initial filter, then precise distance check
    // 1 degree latitude ~ 111km
    const latDelta = radiusKm / 111;
    // 1 degree longitude varies by latitude
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const reports = await prisma.incidentReport.findMany({
      where: {
        latitude: { gte: lat - latDelta, lte: lat + latDelta },
        longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by actual Haversine distance
    return reports.filter((report) => {
      const distance = haversineDistance(lat, lng, report.latitude, report.longitude);
      return distance <= radiusKm;
    });
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
