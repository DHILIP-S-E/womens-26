import { Router, Response, NextFunction } from 'express';
import { AIChatService } from '../services/ai-chat.service';
import { HealthLakeService } from '../services/healthlake.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { chatMessageSchema } from '../utils/validation';

const router = Router();
const aiChatService = new AIChatService();
const healthLakeService = new HealthLakeService();

router.use(authMiddleware);

// POST /ai/chat
router.post('/chat', validate(chatMessageSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await aiChatService.chat(req.user!.userId, req.body.message);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /ai/history
router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const history = await aiChatService.getChatHistory(req.user!.userId, limit);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// POST /ai/export
router.post('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fhirResources = await healthLakeService.exportHealthDataToFHIR(req.user!.userId);
    res.json({ exported: fhirResources.length, resources: fhirResources });
  } catch (err) {
    next(err);
  }
});

export default router;
