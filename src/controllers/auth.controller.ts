import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema } from '../utils/validation';

const router = Router();
const authService = new AuthService();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// POST /auth/signup
router.post('/signup', validate(signupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.signup(req.body);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  res.status(200).json({ message: 'Logged out successfully' });
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
