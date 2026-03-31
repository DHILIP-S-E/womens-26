import { Router, Response, NextFunction } from 'express';
import { MentorService } from '../services/mentor.service';
import { QAService } from '../services/qa.service';
import { ResourceLocationService } from '../services/resource-location.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const mentorService = new MentorService();
const qaService = new QAService();
const resourceLocationService = new ResourceLocationService();

// ============================================================
// Mentorship
// ============================================================

// POST /community/mentors/profile
router.post('/mentors/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bio, isAnonymous, tagIds } = req.body;
    if (!bio || !Array.isArray(tagIds)) {
      res.status(400).json({ error: 'Bio and tagIds are required' });
      return;
    }
    const profile = await mentorService.createProfile(req.user!.userId, { bio, isAnonymous, tagIds });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

// GET /community/mentors/search?tags=tag1,tag2
router.get('/mentors/search', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tagsParam = req.query.tags as string | undefined;
    const tagIds = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
    const mentors = await mentorService.findMentors(tagIds);
    res.json(mentors);
  } catch (err) {
    next(err);
  }
});

// POST /community/mentors/match
router.post('/mentors/match', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) {
      res.status(400).json({ error: 'mentorId is required' });
      return;
    }
    const match = await mentorService.requestMatch(req.user!.userId, mentorId);
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
});

// PATCH /community/mentors/match/:id
router.patch('/mentors/match/:id', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accept } = req.body;
    if (accept === undefined) {
      res.status(400).json({ error: 'accept (boolean) is required' });
      return;
    }
    const match = await mentorService.respondToMatch(req.user!.userId, req.params.id as string, accept);
    res.json(match);
  } catch (err) {
    next(err);
  }
});

// GET /community/mentors/matches
router.get('/mentors/matches', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const matches = await mentorService.getMatches(req.user!.userId);
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

// POST /community/mentors/messages
router.post('/mentors/messages', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { matchId, content } = req.body;
    if (!matchId || !content) {
      res.status(400).json({ error: 'matchId and content are required' });
      return;
    }
    const message = await mentorService.sendMessage(req.user!.userId, matchId, content);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

// GET /community/mentors/messages/:matchId
router.get('/mentors/messages/:matchId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await mentorService.getMessages(req.params.matchId as string);
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Q&A
// ============================================================

// POST /community/questions
router.post('/questions', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, body, category } = req.body;
    if (!title || !body || !category) {
      res.status(400).json({ error: 'Title, body, and category are required' });
      return;
    }
    const question = await qaService.createQuestion(req.user!.userId, { title, body, category });
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
});

// GET /community/questions?category=&page=&limit=
router.get('/questions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const result = await qaService.getQuestions(category, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /community/questions/:id
router.get('/questions/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const question = await qaService.getQuestionWithAnswers(req.params.id as string);
    res.json(question);
  } catch (err) {
    next(err);
  }
});

// POST /community/questions/:id/answers
router.post('/questions/:id/answers', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { body } = req.body;
    if (!body) {
      res.status(400).json({ error: 'Body is required' });
      return;
    }
    const answer = await qaService.createAnswer(req.user!.userId, req.params.id as string, { body });
    res.status(201).json(answer);
  } catch (err) {
    next(err);
  }
});

// POST /community/answers/:id/upvote
router.post('/answers/:id/upvote', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const upvote = await qaService.upvoteAnswer(req.user!.userId, req.params.id as string);
    res.status(201).json(upvote);
  } catch (err) {
    next(err);
  }
});

// DELETE /community/answers/:id/upvote
router.delete('/answers/:id/upvote', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await qaService.removeUpvote(req.user!.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ============================================================
// Resource Locations
// ============================================================

// GET /community/resources?country=&type=&city=
router.get('/resources', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const resources = await resourceLocationService.search({
      country: req.query.country as string | undefined,
      type: req.query.type as string | undefined,
      city: req.query.city as string | undefined,
    });
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

// GET /community/resources/nearby?lat=&lng=&radius=&type=
router.get('/resources/nearby', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string) || 10;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'lat and lng are required' });
      return;
    }

    const resources = await resourceLocationService.getNearby(
      lat,
      lng,
      radius,
      req.query.type as string | undefined,
    );
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

export default router;
