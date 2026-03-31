import { Router, Response, NextFunction } from 'express';
import { MoodService } from '../services/mood.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createMoodSchema, updateMoodSchema } from '../utils/validation';

const router = Router();
const moodService = new MoodService();

router.use(authMiddleware);

// GET /moods?startDate=...&endDate=...
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: { startDate?: Date; endDate?: Date } = {};
    if (req.query.startDate) {
      filter.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filter.endDate = new Date(req.query.endDate as string);
    }
    const moods = await moodService.getUserMoods(req.user!.userId, filter);
    res.json(moods);
  } catch (err) {
    next(err);
  }
});

// GET /moods/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mood = await moodService.getMoodById(req.user!.userId, req.params.id as string);
    res.json(mood);
  } catch (err) {
    next(err);
  }
});

// POST /moods
router.post('/', validate(createMoodSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mood = await moodService.logMood(req.user!.userId, req.body);
    res.status(201).json(mood);
  } catch (err) {
    next(err);
  }
});

// PATCH /moods/:id
router.patch('/:id', validate(updateMoodSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mood = await moodService.updateMood(req.user!.userId, req.params.id as string, req.body);
    res.json(mood);
  } catch (err) {
    next(err);
  }
});

// POST /moods/:id/analyze
router.post('/:id/analyze', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mood = await moodService.analyzeMood(req.user!.userId, req.params.id as string);
    res.json(mood);
  } catch (err) {
    next(err);
  }
});

// DELETE /moods/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await moodService.deleteMood(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
