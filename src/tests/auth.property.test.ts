import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, verifyToken } from '../utils/jwt';

describe('Auth Property Tests', () => {
  // Property 1: Password Hashing Security
  // Hashed password differs from input and is valid bcrypt
  describe('Property 1: Password Hashing Security', () => {
    it('hashed password differs from input and is valid bcrypt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 72 }),
          async (password) => {
            const hashed = await hashPassword(password);
            // Hash must differ from plaintext
            expect(hashed).not.toBe(password);
            // Hash must be valid bcrypt (starts with $2a$ or $2b$)
            expect(hashed).toMatch(/^\$2[ab]\$/);
            // Original password must verify against hash
            const matches = await comparePassword(password, hashed);
            expect(matches).toBe(true);
            // Wrong password must not verify
            const wrongMatches = await comparePassword(password + 'x', hashed);
            expect(wrongMatches).toBe(false);
          }
        ),
        { numRuns: 20 } // bcrypt is slow, limit runs
      );
    });
  });

  // Property 2: JWT Token Validity and Expiry
  // Token is valid and expires in exactly 7 days
  describe('Property 2: JWT Token Validity and Expiry', () => {
    it('token is valid and expires in 7 days', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
          }),
          (payload) => {
            const token = signToken(payload);
            // Token must be a non-empty string
            expect(token).toBeTruthy();
            expect(typeof token).toBe('string');

            // Decode and verify structure
            const decoded = jwt.decode(token) as jwt.JwtPayload;
            expect(decoded).not.toBeNull();
            expect(decoded!.userId).toBe(payload.userId);
            expect(decoded!.email).toBe(payload.email);

            // Verify expiry is ~7 days from now
            const now = Math.floor(Date.now() / 1000);
            const sevenDaysInSeconds = 7 * 24 * 60 * 60;
            const expiry = decoded!.exp!;
            // Allow 5 second tolerance
            expect(expiry).toBeGreaterThanOrEqual(now + sevenDaysInSeconds - 5);
            expect(expiry).toBeLessThanOrEqual(now + sevenDaysInSeconds + 5);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 3: Token Validation and User Identity
  // Valid tokens decode to correct user
  describe('Property 3: Token Validation and User Identity', () => {
    it('valid tokens decode to correct user', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
          }),
          (payload) => {
            const token = signToken(payload);
            const verified = verifyToken(token);
            expect(verified.userId).toBe(payload.userId);
            expect(verified.email).toBe(payload.email);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('invalid tokens throw error', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
      expect(() => verifyToken('')).toThrow();
    });
  });
});
