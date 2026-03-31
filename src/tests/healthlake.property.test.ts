import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { HealthLakeService } from '../services/healthlake.service';

const healthLakeService = new HealthLakeService();

describe('HealthLake Property Tests', () => {
  // Property 16: FHIR Cycle Conversion
  describe('Property 16: FHIR Cycle Conversion', () => {
    it('cycles convert to valid FHIR Observation resources', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            startDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
            endDate: fc.oneof(
              fc.constant(null),
              fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true })
            ),
            cycleLength: fc.integer({ min: 21, max: 35 }),
            periodLength: fc.integer({ min: 3, max: 7 }),
          }),
          (cycle) => {
            const fhir = healthLakeService.convertCycleToFHIR(cycle);
            expect(fhir.resourceType).toBe('Observation');
            expect(fhir.status).toBe('final');
            expect(fhir.code.coding[0].code).toBe('49033-4');
            expect(fhir.subject?.reference).toBe(`Patient/${cycle.userId}`);
            expect(fhir.effectivePeriod?.start).toBeTruthy();
            expect(fhir.valueQuantity?.value).toBe(cycle.cycleLength);
            expect(fhir.valueQuantity?.unit).toBe('days');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 17: FHIR Symptom Conversion
  describe('Property 17: FHIR Symptom Conversion', () => {
    it('symptoms convert to valid FHIR Condition resources', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
            type: fc.constantFrom('cramps', 'headache', 'bloating', 'fatigue', 'nausea'),
            severity: fc.integer({ min: 1, max: 10 }),
          }),
          (symptom) => {
            const fhir = healthLakeService.convertSymptomToFHIR(symptom);
            expect(fhir.resourceType).toBe('Condition');
            expect(fhir.status).toBe('active');
            expect(fhir.code.coding[0].display).toBe(symptom.type);
            expect(fhir.subject?.reference).toBe(`Patient/${symptom.userId}`);
            expect(fhir.effectiveDateTime).toBeTruthy();
            expect(fhir.valueQuantity?.value).toBe(symptom.severity);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 18: FHIR Mood Conversion
  describe('Property 18: FHIR Mood Conversion', () => {
    it('moods convert to valid FHIR Observation resources', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
            mood: fc.constantFrom('happy', 'sad', 'anxious', 'calm', 'neutral'),
            intensity: fc.integer({ min: 1, max: 10 }),
          }),
          (mood) => {
            const fhir = healthLakeService.convertMoodToFHIR(mood);
            expect(fhir.resourceType).toBe('Observation');
            expect(fhir.status).toBe('final');
            expect(fhir.code.coding[0].code).toBe('85353-1');
            expect(fhir.subject?.reference).toBe(`Patient/${mood.userId}`);
            expect(fhir.effectiveDateTime).toBeTruthy();
            expect(fhir.valueQuantity?.value).toBe(mood.intensity);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 19: Health Data Export Exclusion
  describe('Property 19: Health Data Export Exclusion', () => {
    it('exported data should not contain chat history or notes fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            userId: fc.uuid(),
            startDate: fc.date(),
            endDate: fc.constant(null),
            cycleLength: fc.integer({ min: 21, max: 35 }),
            periodLength: fc.integer({ min: 3, max: 7 }),
          }),
          (cycle) => {
            const fhir = healthLakeService.convertCycleToFHIR(cycle);
            const serialized = JSON.stringify(fhir);
            // Should not contain chat history or personal notes
            expect(serialized).not.toContain('chatHistory');
            expect(serialized).not.toContain('"notes"');
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
