import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRouter from './controllers/auth.controller';
import cycleRouter from './controllers/cycle.controller';
import symptomRouter from './controllers/symptom.controller';
import moodRouter from './controllers/mood.controller';
import reminderRouter from './controllers/reminder.controller';
import aiRouter from './controllers/ai.controller';
import safetyRouter from './controllers/safety.controller';
import healthLifecycleRouter from './controllers/health-lifecycle.controller';
import mentalHealthRouter from './controllers/mental-health.controller';
import legalRouter from './controllers/legal.controller';
import financialRouter from './controllers/financial.controller';
import careerRouter from './controllers/career.controller';
import communityRouter from './controllers/community.controller';
import { errorHandler } from './middleware/error-handler';
import { EventBridgeService } from './services/eventbridge.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? false : undefined,
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || true
    : 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRouter);
app.use('/cycles', cycleRouter);
app.use('/symptoms', symptomRouter);
app.use('/moods', moodRouter);
app.use('/reminders', reminderRouter);
app.use('/ai', aiRouter);
app.use('/safety', safetyRouter);
app.use('/health', healthLifecycleRouter);
app.use('/mental-health', mentalHealthRouter);
app.use('/legal', legalRouter);
app.use('/financial', financialRouter);
app.use('/career', careerRouter);
app.use('/community', communityRouter);

// Ensure period-alert EventBridge rule exists on startup
const eventBridgeService = new EventBridgeService();
eventBridgeService.ensurePeriodAlertRule().catch((err) => {
  console.error('Failed to ensure period-alert EventBridge rule:', err);
});

// Serve frontend in production
import path from 'path';
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
