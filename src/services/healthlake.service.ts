import { prisma } from '../utils/prisma';
import axios from 'axios';

export interface FHIRResource {
  resourceType: string;
  id?: string;
  status: string;
  code: { coding: Array<{ system: string; code: string; display: string }> };
  subject?: { reference: string };
  effectiveDateTime?: string;
  effectivePeriod?: { start: string; end?: string };
  valueQuantity?: { value: number; unit: string };
  category?: Array<{ coding: Array<{ system: string; code: string; display: string }> }>;
}

export class HealthLakeService {
  convertCycleToFHIR(cycle: {
    id: string;
    userId: string;
    startDate: Date;
    endDate: Date | null;
    cycleLength: number;
    periodLength: number;
  }): FHIRResource {
    return {
      resourceType: 'Observation',
      id: cycle.id,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'survey',
          display: 'Survey',
        }],
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '49033-4',
          display: 'Menstrual cycle',
        }],
      },
      subject: { reference: `Patient/${cycle.userId}` },
      effectivePeriod: {
        start: cycle.startDate.toISOString(),
        ...(cycle.endDate && { end: cycle.endDate.toISOString() }),
      },
      valueQuantity: {
        value: cycle.cycleLength,
        unit: 'days',
      },
    };
  }

  convertSymptomToFHIR(symptom: {
    id: string;
    userId: string;
    date: Date;
    type: string;
    severity: number;
  }): FHIRResource {
    return {
      resourceType: 'Condition',
      id: symptom.id,
      status: 'active',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'problem-list-item',
          display: 'Problem List Item',
        }],
      }],
      code: {
        coding: [{
          system: 'http://snomed.info/sct',
          code: this.getSymptomSnomedCode(symptom.type),
          display: symptom.type,
        }],
      },
      subject: { reference: `Patient/${symptom.userId}` },
      effectiveDateTime: symptom.date.toISOString(),
      valueQuantity: {
        value: symptom.severity,
        unit: 'severity scale 1-10',
      },
    };
  }

  convertMoodToFHIR(mood: {
    id: string;
    userId: string;
    date: Date;
    mood: string;
    intensity: number;
  }): FHIRResource {
    return {
      resourceType: 'Observation',
      id: mood.id,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'survey',
          display: 'Survey',
        }],
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '85353-1',
          display: 'Mood assessment',
        }],
      },
      subject: { reference: `Patient/${mood.userId}` },
      effectiveDateTime: mood.date.toISOString(),
      valueQuantity: {
        value: mood.intensity,
        unit: 'intensity scale 1-10',
      },
    };
  }

  async exportHealthDataToFHIR(userId: string): Promise<FHIRResource[]> {
    // Fetch user's health data (exclude chat history and personal notes per Property 19)
    const [cycles, symptoms, moods] = await Promise.all([
      prisma.cycle.findMany({
        where: { userId },
        select: { id: true, userId: true, startDate: true, endDate: true, cycleLength: true, periodLength: true },
      }),
      prisma.symptom.findMany({
        where: { userId },
        select: { id: true, userId: true, date: true, type: true, severity: true },
      }),
      prisma.mood.findMany({
        where: { userId },
        select: { id: true, userId: true, date: true, mood: true, intensity: true },
      }),
    ]);

    const fhirResources: FHIRResource[] = [
      ...cycles.map(c => this.convertCycleToFHIR(c)),
      ...symptoms.map(s => this.convertSymptomToFHIR(s)),
      ...moods.map(m => this.convertMoodToFHIR(m)),
    ];

    // Send to AWS HealthLake if configured
    const datastoreEndpoint = process.env.HEALTHLAKE_DATASTORE_ENDPOINT;
    if (datastoreEndpoint) {
      try {
        const bundle = {
          resourceType: 'Bundle',
          type: 'transaction',
          entry: fhirResources.map(resource => ({
            resource,
            request: {
              method: 'PUT',
              url: `${resource.resourceType}/${resource.id}`,
            },
          })),
        };

        await axios.post(datastoreEndpoint, bundle, {
          headers: { 'Content-Type': 'application/fhir+json' },
        });
        console.log(`Exported ${fhirResources.length} FHIR resources for user ${userId}`);
      } catch (error) {
        console.error('Failed to export to HealthLake:', error);
        throw new Error('Failed to export health data to HealthLake');
      }
    }

    return fhirResources;
  }

  private getSymptomSnomedCode(type: string): string {
    const codeMap: Record<string, string> = {
      cramps: '29857009',
      headache: '25064002',
      bloating: '248490000',
      fatigue: '84229001',
      nausea: '422587007',
      back_pain: '161891005',
      breast_tenderness: '53430007',
      acne: '11381005',
      insomnia: '193462001',
      dizziness: '404640003',
      appetite_change: '79890006',
      other: '404684003',
    };
    return codeMap[type] || '404684003';
  }
}
