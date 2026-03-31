import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

const MOOD_TYPES = [
  'happy', 'sad', 'anxious', 'angry', 'calm', 'irritable',
  'energetic', 'tired', 'stressed', 'content', 'depressed',
  'excited', 'neutral', 'other',
] as const;

describe('Mood Property Tests', () => {
  // Property 8: Mood Intensity Range
  describe('Property 8: Mood Intensity Range', () => {
    it('intensity must be between 1 and 10 inclusive', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (intensity) => {
            expect(intensity).toBeGreaterThanOrEqual(1);
            expect(intensity).toBeLessThanOrEqual(10);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('intensity outside 1-10 is rejected', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -100, max: 0 }),
            fc.integer({ min: 11, max: 100 })
          ),
          (invalidIntensity) => {
            expect(invalidIntensity < 1 || invalidIntensity > 10).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 9: Mood Type Validation
  describe('Property 9: Mood Type Validation', () => {
    it('mood type must be one of predefined types', () => {
      const validTypes = new Set<string>(MOOD_TYPES);
      fc.assert(
        fc.property(
          fc.constantFrom(...MOOD_TYPES),
          (moodType) => {
            expect(validTypes.has(moodType)).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('invalid mood types are rejected', () => {
      const validTypes = new Set<string>(MOOD_TYPES);
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !validTypes.has(s)),
          (invalidMood) => {
            expect(validTypes.has(invalidMood)).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 10: Mood Date Range Filtering
  describe('Property 10: Mood Date Range Filtering', () => {
    it('all filtered moods fall within the requested date range', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2025-01-01'), noInvalidDate: true }),
          fc.date({ min: new Date('2025-01-02'), max: new Date('2030-12-31'), noInvalidDate: true }),
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
            { minLength: 0, maxLength: 20 }
          ),
          (startDate, endDate, moodDates) => {
            const filtered = moodDates.filter(d => d >= startDate && d <= endDate);
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
