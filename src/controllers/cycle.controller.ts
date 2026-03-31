import { Router, Response, NextFunction } from 'express';
import { CycleService } from '../services/cycle.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCycleSchema, updateCycleSchema } from '../utils/validation';

const router = Router();
const cycleService = new CycleService();

// All cycle routes require authentication
router.use(authMiddleware);

// GET /cycles
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycles = await cycleService.getUserCycles(req.user!.userId);
    res.json(cycles);
  } catch (err) {
    next(err);
  }
});

// GET /cycles/current
router.get('/current', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycle = await cycleService.getCurrentCycle(req.user!.userId);
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

// GET /cycles/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycle = await cycleService.getCycleById(req.user!.userId, req.params.id as string);
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

// POST /cycles
router.post('/', validate(createCycleSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycle = await cycleService.createCycle(req.user!.userId, req.body);
    res.status(201).json(cycle);
  } catch (err) {
    next(err);
  }
});

// PATCH /cycles/:id
router.patch('/:id', validate(updateCycleSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycle = await cycleService.updateCycle(req.user!.userId, req.params.id as string, req.body);
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

// DELETE /cycles/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await cycleService.deleteCycle(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
