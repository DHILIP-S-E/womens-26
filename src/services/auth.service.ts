import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, verifyToken, JwtPayload } from '../utils/jwt';

export interface SignupInput {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export class AuthService {
  async signup(input: SignupInput): Promise<AuthResult> {
    // Precondition: password meets strength requirements
    if (!PASSWORD_REGEX.test(input.password)) {
      throw new Error('Password must be at least 8 characters with an uppercase letter and a number');
    }

    // Precondition: email not already registered
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('Email already registered');
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        phoneNumber: input.phoneNumber,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    // Postcondition: token is valid and decodes to the created user
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  validateToken(token: string): JwtPayload {
    return verifyToken(token);
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phoneNumber: true,
        timezone: true,
        preferences: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
