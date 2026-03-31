import { Router, Response, NextFunction } from 'express';
import { CrisisService } from '../services/crisis.service';
import { TherapistService } from '../services/therapist.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const crisisService = new CrisisService();
const therapistService = new TherapistService();

// POST /mental-health/crisis/analyze (auth required)
router.post('/crisis/analyze', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }
    const result = await crisisService.analyzeText(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /mental-health/crisis/resources?country=XX
router.get('/crisis/resources', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: 'Country is required' });
      return;
    }
    const resources = await crisisService.getResourcesByCountry(country);
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

// GET /mental-health/crisis/numbers?country=XX
router.get('/crisis/numbers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const country = req.query.country as string;
    if (!country) {
      res.status(400).json({ error: 'Country is required' });
      return;
    }
    const numbers = await crisisService.getCrisisNumbers(country);
    res.json(numbers);
  } catch (err) {
    next(err);
  }
});

// GET /mental-health/therapists?country=&speciality=&language=&isOnline=
router.get('/therapists', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const therapists = await therapistService.search({
      country: req.query.country as string | undefined,
      speciality: req.query.speciality as string | undefined,
      language: req.query.language as string | undefined,
      isOnline: req.query.isOnline !== undefined ? req.query.isOnline === 'true' : undefined,
      costRange: req.query.costRange as string | undefined,
    });
    res.json(therapists);
  } catch (err) {
    next(err);
  }
});

// GET /mental-health/therapists/favourites
router.get('/therapists/favourites', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favourites = await therapistService.getFavourites(req.user!.userId);
    res.json(favourites);
  } catch (err) {
    next(err);
  }
});

// POST /mental-health/therapists/:id/favourite
router.post('/therapists/:id/favourite', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favourite = await therapistService.addFavourite(req.user!.userId, req.params.id as string);
    res.status(201).json(favourite);
  } catch (err) {
    next(err);
  }
});

// DELETE /mental-health/therapists/:id/favourite
router.delete('/therapists/:id/favourite', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await therapistService.removeFavourite(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
