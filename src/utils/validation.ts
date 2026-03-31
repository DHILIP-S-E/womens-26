import { z } from 'zod/v4';

export const signupSchema = z.object({
  email: z.email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/\d/, 'Password must contain a number'),
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  phoneNumber: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

// Cycle schemas
export const createCycleSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  cycleLength: z.number().int().min(1, 'Cycle length must be at least 1'),
  periodLength: z.number().int().min(1, 'Period length must be at least 1'),
  notes: z.string().max(5000).optional(),
});

export const updateCycleSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).nullable().optional(),
  cycleLength: z.number().int().min(1).optional(),
  periodLength: z.number().int().min(1).optional(),
  notes: z.string().max(5000).optional(),
});

// Symptom schemas
export const SYMPTOM_TYPES = [
  'cramps', 'headache', 'bloating', 'fatigue', 'nausea',
  'back_pain', 'breast_tenderness', 'acne', 'insomnia',
  'dizziness', 'appetite_change', 'other',
] as const;

export const createSymptomSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  type: z.string().min(1, 'Symptom type is required').max(100),
  severity: z.number().int().min(1, 'Severity must be at least 1').max(10, 'Severity must be at most 10'),
  cycleId: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateSymptomSchema = z.object({
  date: z.string().transform((val) => new Date(val)).optional(),
  type: z.string().min(1).max(100).optional(),
  severity: z.number().int().min(1).max(10).optional(),
  cycleId: z.string().nullable().optional(),
  notes: z.string().max(5000).optional(),
});

// Mood schemas
export const MOOD_TYPES = [
  'happy', 'sad', 'anxious', 'angry', 'calm', 'irritable',
  'energetic', 'tired', 'stressed', 'content', 'depressed',
  'excited', 'neutral', 'other',
] as const;

export const createMoodSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  mood: z.enum(MOOD_TYPES, { error: 'Invalid mood type' }),
  intensity: z.number().int().min(1, 'Intensity must be at least 1').max(10, 'Intensity must be at most 10'),
  triggers: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateMoodSchema = z.object({
  date: z.string().transform((val) => new Date(val)).optional(),
  mood: z.enum(MOOD_TYPES).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  triggers: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
});

// Reminder schemas
export const REMINDER_TYPES = ['period_alert', 'medication', 'custom'] as const;
export const REMINDER_FREQUENCIES = ['once', 'daily', 'weekly', 'monthly'] as const;
export const NOTIFICATION_METHODS = ['sms', 'email', 'push'] as const;

export const createReminderSchema = z.object({
  type: z.enum(REMINDER_TYPES, { error: 'Invalid reminder type' }),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional().default(''),
  scheduledTime: z.string().transform((val) => new Date(val)),
  frequency: z.enum(REMINDER_FREQUENCIES, { error: 'Invalid frequency' }),
  notificationMethod: z.enum(NOTIFICATION_METHODS, { error: 'Invalid notification method' }).optional().default('sms'),
});

export const updateReminderSchema = z.object({
  type: z.enum(REMINDER_TYPES).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  scheduledTime: z.string().transform((val) => new Date(val)).optional(),
  frequency: z.enum(REMINDER_FREQUENCIES).optional(),
  isActive: z.boolean().optional(),
  notificationMethod: z.enum(NOTIFICATION_METHODS).optional(),
});

// AI Chat schema
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000),
});

// ============================================================
// Safety & Emergency schemas
// ============================================================

// Trusted Contact schemas
export const createTrustedContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phoneNumber: z.string().min(1, 'Phone number is required').max(20),
  email: z.email('Invalid email address').optional(),
  relationship: z.string().min(1, 'Relationship is required').max(100),
  isPrimary: z.boolean().optional().default(false),
});

export const updateTrustedContactSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phoneNumber: z.string().min(1).max(20).optional(),
  email: z.email('Invalid email address').optional(),
  relationship: z.string().min(1).max(100).optional(),
  isPrimary: z.boolean().optional(),
});

// SOS schemas
export const triggerSOSSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Safe Walk schemas
export const startSafeWalkSchema = z.object({
  startLat: z.number().min(-90).max(90),
  startLng: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  expectedArrival: z.string().transform((val) => new Date(val)),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Incident Report schemas
export const INCIDENT_TYPES = [
  'catcalling', 'following', 'assault', 'groping', 'other',
] as const;

export const createIncidentReportSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  type: z.string().min(1, 'Incident type is required').max(100),
  severity: z.number().int().min(1, 'Severity must be at least 1').max(5, 'Severity must be at most 5'),
  description: z.string().max(5000).optional(),
});

// ============================================================
// Domain 2: Health Lifecycle Schemas
// ============================================================

// Fertility schemas
export const OVULATION_TEST_VALUES = ['positive', 'negative', 'not_tested'] as const;
export const CERVICAL_MUCUS_VALUES = ['dry', 'sticky', 'creamy', 'watery', 'eggwhite'] as const;

export const logFertilitySchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  bbt: z.number().min(35.0, 'BBT must be at least 35.0°C').max(42.0, 'BBT must be at most 42.0°C').optional(),
  ovulationTest: z.enum(OVULATION_TEST_VALUES).optional(),
  cervicalMucus: z.enum(CERVICAL_MUCUS_VALUES).optional(),
  intercourse: z.boolean().optional(),
  notes: z.string().max(5000).optional(),
});

export const IVF_STAGES = ['stimulation', 'retrieval', 'fertilisation', 'transfer', 'wait', 'result'] as const;
export const IVF_OUTCOMES = ['positive', 'negative', 'chemical', 'miscarriage', 'pending'] as const;

export const createIVFCycleSchema = z.object({
  cycleNumber: z.number().int().min(1, 'Cycle number must be at least 1'),
  stage: z.enum(IVF_STAGES, { error: 'Invalid IVF stage' }),
  startDate: z.string().transform((val) => new Date(val)),
  medications: z.any().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateIVFStageSchema = z.object({
  stage: z.enum(IVF_STAGES, { error: 'Invalid IVF stage' }),
  outcome: z.enum(IVF_OUTCOMES).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().max(5000).optional(),
});

// Pregnancy schemas
export const logPregnancyWeekSchema = z.object({
  week: z.number().int().min(1, 'Week must be at least 1').max(42, 'Week must be at most 42'),
  weight: z.number().positive('Weight must be positive').optional(),
  bloodPressure: z.string().max(20).optional(),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
});

export const createBirthPlanSchema = z.object({
  preferences: z.record(z.string(), z.any()),
});

export const logContractionSchema = z.object({
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
  intensity: z.number().int().min(1, 'Intensity must be at least 1').max(10, 'Intensity must be at most 10'),
});

export const logKickSchema = z.object({
  week: z.number().int().min(1).max(42),
  count: z.number().int().min(1, 'Count must be at least 1'),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  startTime: z.string().transform((val) => new Date(val)),
});

// Postpartum schemas
export const submitEPDSSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)).length(10, 'EPDS requires exactly 10 answers'),
});

export const FEEDING_TYPES = ['breast_left', 'breast_right', 'bottle', 'formula'] as const;

export const logFeedingSchema = z.object({
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)).optional(),
  type: z.enum(FEEDING_TYPES, { error: 'Invalid feeding type' }),
  duration: z.number().int().min(1).optional(),
  latchRating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(5000).optional(),
});

export const logBabySleepSchema = z.object({
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)).optional(),
  quality: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(5000).optional(),
});

// Menopause schemas
export const logHotFlashSchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  duration: z.number().int().min(1, 'Duration must be at least 1 second'),
  severity: z.number().int().min(1, 'Severity must be at least 1').max(10, 'Severity must be at most 10'),
  trigger: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

// Grief schemas
export const GRIEF_STAGES = ['denial', 'anger', 'bargaining', 'depression', 'acceptance'] as const;

export const createGriefEntrySchema = z.object({
  date: z.string().transform((val) => new Date(val)),
  stage: z.enum(GRIEF_STAGES).optional(),
  content: z.string().min(1, 'Content is required').max(10000),
});
