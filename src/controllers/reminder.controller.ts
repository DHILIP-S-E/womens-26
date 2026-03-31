import { Router, Response, NextFunction } from 'express';
import { ReminderService } from '../services/reminder.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createReminderSchema, updateReminderSchema } from '../utils/validation';

const router = Router();
const reminderService = new ReminderService();

router.use(authMiddleware);

// GET /reminders
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminders = await reminderService.getUserReminders(req.user!.userId);
    res.json(reminders);
  } catch (err) {
    next(err);
  }
});

// GET /reminders/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminder = await reminderService.getReminderById(req.user!.userId, req.params.id as string);
    res.json(reminder);
  } catch (err) {
    next(err);
  }
});

// POST /reminders
router.post('/', validate(createReminderSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminder = await reminderService.createReminder(req.user!.userId, req.body);
    res.status(201).json(reminder);
  } catch (err) {
    next(err);
  }
});

// PATCH /reminders/:id
router.patch('/:id', validate(updateReminderSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reminder = await reminderService.updateReminder(req.user!.userId, req.params.id as string, req.body);
    res.json(reminder);
  } catch (err) {
    next(err);
  }
});

// DELETE /reminders/:id
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await reminderService.deleteReminder(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
