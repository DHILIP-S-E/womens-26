import { Router, Response, NextFunction } from 'express';
import { LegalService } from '../services/legal.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const legalService = new LegalService();

// GET /legal/content?country=&category=&language=
router.get('/content', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: 'Country is required' });
      return;
    }
    const content = await legalService.getContent(
      country,
      req.query.category as string | undefined,
      req.query.language as string | undefined,
    );
    res.json(content);
  } catch (err) {
    next(err);
  }
});

// GET /legal/search?q=&country=
router.get('/search', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.status(400).json({ error: 'Search query (q) is required' });
      return;
    }
    const results = await legalService.searchContent(q, req.query.country as string | undefined);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /legal/divorce-rules?country=
router.get('/divorce-rules', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: 'Country is required' });
      return;
    }
    const rules = await legalService.getDivorceRules(country);
    res.json(rules);
  } catch (err) {
    next(err);
  }
});

export default router;
