import { Router, Request, Response, NextFunction } from 'express';
import { TrustedContactService } from '../services/trusted-contact.service';
import { SOSService } from '../services/sos.service';
import { SafeWalkService } from '../services/safe-walk.service';
import { IncidentReportService } from '../services/incident-report.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createTrustedContactSchema,
  updateTrustedContactSchema,
  triggerSOSSchema,
  startSafeWalkSchema,
  updateLocationSchema,
  createIncidentReportSchema,
} from '../utils/validation';

const router = Router();
const trustedContactService = new TrustedContactService();
const sosService = new SOSService();
const safeWalkService = new SafeWalkService();
const incidentReportService = new IncidentReportService();

// ============================================================
// Trusted Contacts (all require auth)
// ============================================================

// GET /safety/contacts
router.get('/contacts', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contacts = await trustedContactService.getContacts(req.user!.userId);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

// POST /safety/contacts
router.post('/contacts', authMiddleware, validate(createTrustedContactSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contact = await trustedContactService.addContact(req.user!.userId, req.body);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

// PATCH /safety/contacts/:id
router.patch('/contacts/:id', authMiddleware, validate(updateTrustedContactSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const contact = await trustedContactService.updateContact(req.user!.userId, req.params.id as string, req.body);
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

// DELETE /safety/contacts/:id
router.delete('/contacts/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await trustedContactService.deleteContact(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ============================================================
// SOS Alerts (all require auth)
// ============================================================

// POST /safety/sos
router.post('/sos', authMiddleware, validate(triggerSOSSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alert = await sosService.triggerSOS(req.user!.userId, req.body);
    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
});

// GET /safety/sos/history
router.get('/sos/history', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alerts = await sosService.getUserAlerts(req.user!.userId);
    res.json(alerts);
  } catch (err) {
    next(err);
  }
});

// PATCH /safety/sos/:id/resolve
router.patch('/sos/:id/resolve', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.body.status || 'resolved';
    const alert = await sosService.resolveAlert(req.user!.userId, req.params.id as string, status);
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Safe Walk (mostly requires auth, except public tracking)
// ============================================================

// POST /safety/walk/start
router.post('/walk/start', authMiddleware, validate(startSafeWalkSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await safeWalkService.startSession(req.user!.userId, req.body);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// PATCH /safety/walk/:id/location
router.patch('/walk/:id/location', authMiddleware, validate(updateLocationSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await safeWalkService.updateLocation(req.user!.userId, req.params.id as string, req.body);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// POST /safety/walk/:id/complete
router.post('/walk/:id/complete', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await safeWalkService.completeSession(req.user!.userId, req.params.id as string);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// GET /safety/walk/active
router.get('/walk/active', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await safeWalkService.getActiveSession(req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// GET /safety/walk/track/:token (NO AUTH - public tracking page)
router.get('/walk/track/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await safeWalkService.getPublicSession(req.params.token as string);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Incident Reports (all public - no auth required)
// ============================================================

// POST /safety/incidents
router.post('/incidents', validate(createIncidentReportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await incidentReportService.createReport(req.body);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

// GET /safety/incidents/heatmap
router.get('/incidents/heatmap', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await incidentReportService.getHeatmapData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /safety/incidents/nearby?lat=&lng=&radius=
router.get('/incidents/nearby', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radius as string) || 5;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'lat and lng query parameters are required' });
      return;
    }

    const incidents = await incidentReportService.getNearbyIncidents(lat, lng, radiusKm);
    res.json(incidents);
  } catch (err) {
    next(err);
  }
});

export default router;
