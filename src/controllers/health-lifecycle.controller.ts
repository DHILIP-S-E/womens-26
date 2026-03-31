import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  logFertilitySchema,
  createIVFCycleSchema,
  updateIVFStageSchema,
  logPregnancyWeekSchema,
  createBirthPlanSchema,
  logContractionSchema,
  logKickSchema,
  submitEPDSSchema,
  logFeedingSchema,
  logBabySleepSchema,
  logHotFlashSchema,
  createGriefEntrySchema,
} from '../utils/validation';
import { FertilityService } from '../services/fertility.service';
import { PregnancyService } from '../services/pregnancy.service';
import { PostpartumService } from '../services/postpartum.service';
import { MenopauseService } from '../services/menopause.service';
import { GriefService } from '../services/grief.service';

const router = Router();
const fertilityService = new FertilityService();
const pregnancyService = new PregnancyService();
const postpartumService = new PostpartumService();
const menopauseService = new MenopauseService();
const griefService = new GriefService();

// All health lifecycle routes require authentication
router.use(authMiddleware);

// ============================================================
// Fertility
// ============================================================

// POST /health/fertility
router.post('/fertility', validate(logFertilitySchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await fertilityService.logFertility(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/fertility
router.get('/fertility', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.startDate) filter.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filter.endDate = new Date(req.query.endDate as string);
    const logs = await fertilityService.getUserFertilityLogs(req.user!.userId, filter);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// POST /health/ivf
router.post('/ivf', validate(createIVFCycleSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycle = await fertilityService.createIVFCycle(req.user!.userId, req.body);
    res.status(201).json(cycle);
  } catch (err) {
    next(err);
  }
});

// PATCH /health/ivf/:id
router.patch('/ivf/:id', validate(updateIVFStageSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycle = await fertilityService.updateIVFStage(req.user!.userId, req.params.id as string, req.body);
    res.json(cycle);
  } catch (err) {
    next(err);
  }
});

// GET /health/ivf
router.get('/ivf', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cycles = await fertilityService.getUserIVFCycles(req.user!.userId);
    res.json(cycles);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Pregnancy
// ============================================================

// POST /health/pregnancy
router.post('/pregnancy', validate(logPregnancyWeekSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await pregnancyService.logWeek(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/pregnancy
router.get('/pregnancy', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await pregnancyService.getUserPregnancyLogs(req.user!.userId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// POST /health/birth-plan
router.post('/birth-plan', validate(createBirthPlanSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await pregnancyService.createBirthPlan(req.user!.userId, req.body.preferences);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

// POST /health/contractions
router.post('/contractions', validate(logContractionSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await pregnancyService.logContraction(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/contractions
router.get('/contractions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const last24h = req.query.last24h === 'true';
    const logs = await pregnancyService.getContractions(req.user!.userId, last24h);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// POST /health/kicks
router.post('/kicks', validate(logKickSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await pregnancyService.logKick(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/kicks
router.get('/kicks', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const week = req.query.week ? parseInt(req.query.week as string, 10) : undefined;
    const logs = await pregnancyService.getKickLogs(req.user!.userId, week);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Postpartum
// ============================================================

// POST /health/epds
router.post('/epds', validate(submitEPDSSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assessment = await postpartumService.submitEPDS(req.user!.userId, req.body.answers);
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
});

// GET /health/epds
router.get('/epds', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const history = await postpartumService.getEPDSHistory(req.user!.userId);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// POST /health/feeding
router.post('/feeding', validate(logFeedingSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await postpartumService.logFeeding(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/feeding
router.get('/feeding', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.startDate) filter.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filter.endDate = new Date(req.query.endDate as string);
    const logs = await postpartumService.getFeedingLogs(req.user!.userId, filter);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// POST /health/baby-sleep
router.post('/baby-sleep', validate(logBabySleepSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await postpartumService.logBabySleep(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/baby-sleep
router.get('/baby-sleep', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.startDate) filter.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filter.endDate = new Date(req.query.endDate as string);
    const logs = await postpartumService.getBabySleepLogs(req.user!.userId, filter);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Menopause
// ============================================================

// POST /health/hot-flashes
router.post('/hot-flashes', validate(logHotFlashSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const log = await menopauseService.logHotFlash(req.user!.userId, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

// GET /health/hot-flashes
router.get('/hot-flashes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.startDate) filter.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filter.endDate = new Date(req.query.endDate as string);
    const logs = await menopauseService.getHotFlashLogs(req.user!.userId, filter);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// GET /health/hot-flashes/stats — must be before any /:id route
router.get('/hot-flashes/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await menopauseService.getHotFlashStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Grief
// ============================================================

// POST /health/grief
router.post('/grief', validate(createGriefEntrySchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entry = await griefService.createEntry(req.user!.userId, req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// GET /health/grief
router.get('/grief', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entries = await griefService.getEntries(req.user!.userId);
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

// DELETE /health/grief/:id
router.delete('/grief/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await griefService.deleteEntry(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
