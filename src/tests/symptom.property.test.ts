import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('Symptom Property Tests', () => {
  // Property 6: Symptom Severity Range
  describe('Property 6: Symptom Severity Range', () => {
    it('severity must be between 1 and 10 inclusive', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (severity) => {
            expect(severity).toBeGreaterThanOrEqual(1);
            expect(severity).toBeLessThanOrEqual(10);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('severity outside 1-10 is rejected', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -100, max: 0 }),
            fc.integer({ min: 11, max: 100 })
          ),
          (invalidSeverity) => {
            expect(invalidSeverity < 1 || invalidSeverity > 10).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 7: Symptom Date Range Filtering
  describe('Property 7: Symptom Date Range Filtering', () => {
    it('all filtered symptoms fall within the requested date range', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2025-01-01'), noInvalidDate: true }),
          fc.date({ min: new Date('2025-01-02'), max: new Date('2030-12-31'), noInvalidDate: true }),
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
            { minLength: 0, maxLength: 20 }
          ),
          (startDate, endDate, symptomDates) => {
            const filtered = symptomDates.filter(d => d >= startDate && d <= endDate);
            for (const date of filtered) {
              expect(date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
              expect(date.getTime()).toBeLessThanOrEqual(endDate.getTime());
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
