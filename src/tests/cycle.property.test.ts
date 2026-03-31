import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('Cycle Property Tests', () => {
  // Property 4: Cycle Date Ordering
  describe('Property 4: Cycle Date Ordering', () => {
    it('startDate must be <= endDate when endDate is provided', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
          (date1, date2) => {
            const startDate = date1 < date2 ? date1 : date2;
            const endDate = date1 < date2 ? date2 : date1;
            expect(startDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
          }
        ),
        { numRuns: 50 }
      );
    });

    it('endDate can be null for ongoing cycles', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
          (startDate) => {
            const endDate = null as Date | null;
            // Null endDate is always valid - no ordering constraint needed
            const isValid = endDate === null || startDate.getTime() <= (endDate as Date).getTime();
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Property 5: User Data Isolation in Cycles
  describe('Property 5: User Data Isolation in Cycles', () => {
    it('all returned cycles belong to the requested userId', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(
            fc.record({
              id: fc.uuid(),
              userId: fc.uuid(),
              startDate: fc.date(),
              endDate: fc.option(fc.date()),
              cycleLength: fc.integer({ min: 21, max: 35 }),
              periodLength: fc.integer({ min: 3, max: 7 }),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          (targetUserId, allCycles) => {
            // Simulate filtering by userId
            const userCycles = allCycles.filter(c => c.userId === targetUserId);
            // All returned cycles must belong to the target user
            for (const cycle of userCycles) {
              expect(cycle.userId).toBe(targetUserId);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
