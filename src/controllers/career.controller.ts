import { Router, Response, NextFunction } from 'express';
import { CareerService } from '../services/career.service';
import { BurnoutService } from '../services/burnout.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const careerService = new CareerService();
const burnoutService = new BurnoutService();

// GET /career/salary?country=&role=&level=
router.get('/salary', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: 'Country is required' });
      return;
    }
    const benchmarks = await careerService.getSalaryBenchmarks(
      country,
      req.query.role as string | undefined,
      req.query.level as string | undefined,
    );
    res.json(benchmarks);
  } catch (err) {
    next(err);
  }
});

// POST /career/milestones
router.post('/milestones', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, title, company, salary, date, notes } = req.body;
    if (!type || !title || !date) {
      res.status(400).json({ error: 'Type, title, and date are required' });
      return;
    }
    const milestone = await careerService.addMilestone(req.user!.userId, {
      type,
      title,
      company,
      salary,
      date: new Date(date),
      notes,
    });
    res.status(201).json(milestone);
  } catch (err) {
    next(err);
  }
});

// GET /career/milestones
router.get('/milestones', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const milestones = await careerService.getMilestones(req.user!.userId);
    res.json(milestones);
  } catch (err) {
    next(err);
  }
});

// GET /career/content?category=&country=
router.get('/content', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    if (!category) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }
    const content = await careerService.getContentByCategory(
      category,
      req.query.country as string | undefined,
    );
    res.json(content);
  } catch (err) {
    next(err);
  }
});

// POST /career/burnout
router.post('/burnout', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      res.status(400).json({ error: 'Answers must be an array' });
      return;
    }
    const assessment = await burnoutService.submitAssessment(req.user!.userId, answers);
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
});

// GET /career/burnout/history
router.get('/burnout/history', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await burnoutService.getHistory(req.user!.userId);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

export default router;
