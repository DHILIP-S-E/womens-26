import { Router, Response, NextFunction } from 'express';
import { FinancialService } from '../services/financial.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const financialService = new FinancialService();

router.use(authMiddleware);

// POST /financial/goals
router.post('/goals', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, targetAmount, currency, deadline } = req.body;
    if (!title || targetAmount === undefined) {
      res.status(400).json({ error: 'Title and targetAmount are required' });
      return;
    }
    const goal = await financialService.createGoal(req.user!.userId, {
      title,
      targetAmount,
      currency,
      deadline: deadline ? new Date(deadline) : undefined,
    });
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
});

// GET /financial/goals
router.get('/goals', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goals = await financialService.getGoals(req.user!.userId);
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

// PATCH /financial/goals/:id
router.patch('/goals/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const goal = await financialService.updateGoal(req.user!.userId, req.params.id as string, {
      ...req.body,
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    });
    res.json(goal);
  } catch (err) {
    next(err);
  }
});

// DELETE /financial/goals/:id
router.delete('/goals/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await financialService.deleteGoal(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
