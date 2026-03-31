# Requirements: Health Tracking Application

## Functional Requirements

### 1. Authentication & User Management
- 1.1 Users can sign up with email, password, first name, last name, date of birth
- 1.2 Password requirements: min 8 chars, uppercase letter, number
- 1.3 Users can log in with email and password
- 1.4 JWT tokens with 7-day expiry, HTTP-only cookies
- 1.5 Users can log out (session cleared)
- 1.6 Protected routes require valid authentication

### 2. Menstrual Cycle Tracking
- 2.1 Users can create, read, update, delete cycles
- 2.2 Cycles have start date, optional end date, cycle length, period length, notes
- 2.3 Start date must be <= end date (or end date null for ongoing)
- 2.4 All cycles isolated per user (no cross-user data access)

### 3. Symptom Logging
- 3.1 Users can log symptoms with date, type, severity (1-10), optional notes
- 3.2 Symptom types: cramps, headache, bloating, fatigue, nausea, back_pain, breast_tenderness, acne, insomnia, dizziness, appetite_change, other
- 3.3 Symptoms can be filtered by date range
- 3.4 Symptoms optionally linked to a cycle
- 3.5 Auto-analysis: symptom notes analyzed by AWS Comprehend Medical on creation (background, non-blocking)
- 3.6 On-demand analysis: POST /symptoms/:id/analyze returns medical insights synchronously

### 4. Mood Tracking
- 4.1 Users can log moods with date, mood type, intensity (1-10), triggers, optional notes
- 4.2 Mood types: happy, sad, anxious, angry, calm, irritable, energetic, tired, stressed, content, depressed, excited, neutral, other
- 4.3 Moods can be filtered by date range
- 4.4 Auto-analysis: mood notes + triggers analyzed by AWS Comprehend Medical on creation (background, non-blocking)
- 4.5 On-demand analysis: POST /moods/:id/analyze returns medical insights synchronously

### 5. Medical Insights (AWS Comprehend Medical)
- 5.1 Analyze text using DetectEntitiesV2 to extract medical entities (conditions, medications, anatomy, symptoms, tests/treatments)
- 5.2 Analyze text using InferICD10CM to extract ICD-10-CM diagnosis codes
- 5.3 Analyze text using InferRxNorm to extract medication codes
- 5.4 Analyze text using InferSNOMEDCT to extract clinical terminology codes
- 5.5 All 4 APIs called in parallel for maximum insight
- 5.6 Results stored as medicalInsights JSON field on Symptom and Mood models
- 5.7 Only analyze text with 3+ characters (skip empty notes)
- 5.8 Codes filtered to confidence score > 0.5

### 6. Reminders & Notifications
- 6.1 Users can create reminders with type (period_alert, medication, custom), title, description, scheduled time, frequency, notification method
- 6.2 Frequencies: once, daily, weekly, monthly
- 6.3 Scheduled time must be in the future
- 6.4 Reminders default to isActive: true
- 6.5 SMS notifications sent via AWS SNS

### 7. Serverless Reminder Scheduling (AWS Lambda + EventBridge)
- 7.1 Each active reminder gets an EventBridge scheduled rule named reminder-{id}
- 7.2 EventBridge rules trigger the reminder-processor Lambda with { reminderId } payload
- 7.3 reminder-processor Lambda: queries DB for reminder + user, sends SMS, deactivates one-time reminders
- 7.4 period-alert Lambda: runs daily at 8 AM UTC, finds cycles starting today, sends SMS
- 7.5 One-time reminders self-cleanup their EventBridge rule after firing
- 7.6 Express app manages EventBridge rules via EventBridgeService on create/update/delete
- 7.7 ensurePeriodAlertRule called at Express startup (idempotent)

### 8. AI Health Assistant
- 8.1 Users can chat with AI assistant (Google Gemini 1.5-flash)
- 8.2 AI context includes recent moods (10), recent symptoms (10), current cycle
- 8.3 Chat history stored in database
- 8.4 Responses must be non-empty and contextually relevant

### 9. Health Data Export (AWS HealthLake)
- 9.1 Cycles converted to FHIR Observation resources
- 9.2 Symptoms converted to FHIR Condition resources
- 9.3 Moods converted to FHIR Observation resources
- 9.4 Raw chat history and personal notes excluded from export

### 10. Frontend
- 10.1 React 19 + TypeScript + Vite + Tailwind CSS + Radix UI
- 10.2 Screens: Login, Signup, Dashboard, CycleTracker, SymptomLogger, MoodTracker, Reminders, AIChat
- 10.3 Dark/light mode with persistence to database
- 10.4 React Query caching (cycles: 5 min, moods/symptoms: 10 min)
- 10.5 Lazy loading for non-critical screens
- 10.6 Framer Motion animations (page transitions, card hover, button tap)
- 10.7 PWA support with service worker (offline read, write queuing)

## Non-Functional Requirements

### 11. Security
- 11.1 Helmet security headers (X-Frame-Options, X-Content-Type-Options, HSTS)
- 11.2 CORS whitelist frontend domain only
- 11.3 Rate limiting: 100 requests per 15 minutes
- 11.4 Parameterized queries via Prisma (SQL injection prevention)
- 11.5 bcrypt password hashing with 10 salt rounds

### 12. Performance
- 12.1 Database queries < 100ms (indexed on userId, date fields)
- 12.2 React Query cache invalidation on mutations
- 12.3 Lazy loading for non-critical screens

### 13. Infrastructure
- 13.1 Backend: Express.js on Node.js
- 13.2 Database: PostgreSQL via Prisma ORM 7.x with pg adapter
- 13.3 Frontend: React on Vite, deployed separately
- 13.4 AWS: SNS, HealthLake, Comprehend Medical, Lambda, EventBridge, CloudWatch, IAM
- 13.5 Infrastructure as Code: Terraform manages all AWS resources (19 resources)
- 13.6 Lambda runtime: Node.js 20.x, 256MB memory, 30-60s timeout

### 14. AWS Free Tier Usage
- 14.1 Comprehend Medical: 5,000 units/month (12 months free tier)
- 14.2 Lambda: 1M requests/month (always free)
- 14.3 EventBridge: free for scheduled rules
- 14.4 SNS: 100 SMS free/month
- 14.5 CloudWatch Logs: 5 GB free/month
- 14.6 IAM: always free
- 14.7 HealthLake: pay-per-use (~$0.30-$1/month at low usage)
