import { Router, Response, NextFunction } from 'express';
import { SymptomService } from '../services/symptom.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createSymptomSchema, updateSymptomSchema } from '../utils/validation';

const router = Router();
const symptomService = new SymptomService();

router.use(authMiddleware);

// GET /symptoms?startDate=...&endDate=...
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: { startDate?: Date; endDate?: Date } = {};
    if (req.query.startDate) {
      filter.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filter.endDate = new Date(req.query.endDate as string);
    }
    const symptoms = await symptomService.getUserSymptoms(req.user!.userId, filter);
    res.json(symptoms);
  } catch (err) {
    next(err);
  }
});

// GET /symptoms/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const symptom = await symptomService.getSymptomById(req.user!.userId, req.params.id as string);
    res.json(symptom);
  } catch (err) {
    next(err);
  }
});

// POST /symptoms
router.post('/', validate(createSymptomSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const symptom = await symptomService.logSymptom(req.user!.userId, req.body);
    res.status(201).json(symptom);
  } catch (err) {
    next(err);
  }
});

// PATCH /symptoms/:id
router.patch('/:id', validate(updateSymptomSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const symptom = await symptomService.updateSymptom(req.user!.userId, req.params.id as string, req.body);
    res.json(symptom);
  } catch (err) {
    next(err);
  }
});

// POST /symptoms/:id/analyze
router.post('/:id/analyze', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const symptom = await symptomService.analyzeSymptom(req.user!.userId, req.params.id as string);
    res.json(symptom);
  } catch (err) {
    next(err);
  }
});

// DELETE /symptoms/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await symptomService.deleteSymptom(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
