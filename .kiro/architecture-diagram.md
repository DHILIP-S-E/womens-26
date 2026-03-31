# Women's Health & Safety Platform - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                       │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard  │  │ Health Track │  │   AI Chat    │  │   Safety     │  │
│  │   (Home)     │  │   (Cycles,   │  │   (Gemini)   │  │   (SOS, Safe │  │
│  │              │  │   Symptoms)  │  │              │  │    Walk)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Pregnancy   │  │  Fertility    │  │  Menopause   │  │   Career &   │  │
│  │  Companion   │  │  Tracker      │  │   Center     │  │   Financial  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Mentor     │  │   Q&A Forum  │  │   Resource   │  │   Legal      │  │
│  │   Hub        │  │              │  │   Map        │  │   Rights     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Shared Components & Hooks                        │  │
│  │  • useAuth, useHealthData, useTheme, useSafetyData                 │  │
│  │  • Button, Card, Input, Modal, Layout                             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓ (REST API)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + TypeScript)                           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         API Controllers                             │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   Auth       │  │   Health &   │  │   Safety     │             │  │
│  │  │ (Login/Reg)  │  │   Lifecycle  │  │ (SOS, Walks) │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   Mental     │  │   Career &   │  │   Community  │             │  │
│  │  │   Health     │  │   Financial  │  │ (Mentor/QA)  │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   Cycle      │  │   Mood       │  │   Reminder   │             │  │
│  │  │   Tracker    │  │   Tracker    │  │   Processor  │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   Legal      │  │   AI Chat    │  │   Symptom    │             │  │
│  │  │   Content    │  │   Handler    │  │   Logger     │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    ↓                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    AWS Services Integration                         │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │   SNS        │  │   EventBridge│  │   Lambda     │             │  │
│  │  │ (SMS/Email)  │  │ (Scheduling) │  │ (Processing) │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  │                                                                     │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │ HealthLake   │  │ Comprehend   │  │   S3         │             │  │
│  │  │ (Medical     │  │   Medical    │  │ (Files/PDFs) │             │  │
│  │  │  Records)    │  │ (Insights)   │  │              │             │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL + Prisma ORM)                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         Core Tables                                 │  │
│  │                                                                     │  │
│  │  • User (auth, preferences, profile)                               │  │
│  │  • Cycle, Symptom, Mood (health tracking)                          │  │
│  │  • Reminder (scheduled notifications)                              │  │
│  │  • ChatHistory (AI conversations)                                  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Safety & Emergency                               │  │
│  │                                                                     │  │
│  │  • TrustedContact, SOSAlert, SafeWalkSession                        │  │
│  │  • IncidentReport (anonymous)                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Health Lifecycle                                 │  │
│  │                                                                     │  │
│  │  Fertility: FertilityLog, IVFCycle                                  │  │
│  │  Pregnancy: PregnancyLog, BirthPlan, ContractionLog, KickLog        │  │
│  │  Postpartum: EPDSAssessment, FeedingLog, BabySleepLog               │  │
│  │  Menopause: HotFlashLog                                            │  │
│  │  Grief: GriefJournal                                               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Mental Health & Resources                        │  │
│  │                                                                     │  │
│  │  • TherapistProfile, UserFavouriteTherapist                         │  │
│  │  • ResourcePathway, ResourceLocation                               │  │
│  │  • CrisisKeyword                                                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Legal & Financial                                │  │
│  │                                                                     │  │
│  │  • LegalContent, DivorceRule                                        │  │
│  │  • FinancialGoal, SalaryBenchmark                                   │  │
│  │  • CareerMilestone, BurnoutAssessment                               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    Community & Mentorship                           │  │
│  │                                                                     │  │
│  │  • MentorProfile, MentorMatch, MentorMessage                        │  │
│  │  • ExpertProfile, Question, Answer, UpVote                          │  │
│  │  • ExperienceTag, MentorProfileTag                                  │  │
│  │  • ContentBlock (dynamic content)                                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTIONS                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React Components)                            │
│                                                                             │
│  • Captures user input (health data, mood, symptoms, etc.)                 │
│  • Calls API services (api.ts, health.service.ts, etc.)                    │
│  • Manages local state with hooks (useAuth, useHealthData, etc.)           │
│  • Displays real-time data and notifications                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓ (HTTP REST API)
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express Controllers)                          │
│                                                                             │
│  1. Request Validation (Zod schemas)                                       │
│  2. Authentication (JWT tokens)                                            │
│  3. Business Logic Processing                                              │
│  4. Database Operations (Prisma ORM)                                       │
│  5. AWS Service Integration                                                │
│  6. Response Formatting                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AWS SERVICES & INTEGRATIONS                              │
│                                                                             │
│  SNS (Simple Notification Service)                                         │
│  ├─ Sends SMS reminders for period alerts                                  │
│  ├─ Sends email notifications                                              │
│  └─ Triggers Lambda functions                                              │
│                                                                             │
│  EventBridge                                                                │
│  ├─ Schedules recurring reminders (daily, weekly, monthly)                 │
│  ├─ Triggers Lambda functions at scheduled times                           │
│  └─ Manages reminder lifecycle                                             │
│                                                                             │
│  Lambda Functions                                                           │
│  ├─ period-alert: Sends period predictions & alerts                        │
│  ├─ reminder-processor: Processes scheduled reminders                      │
│  └─ Shared utilities (db.ts, sns.ts)                                       │
│                                                                             │
│  HealthLake                                                                 │
│  ├─ Stores medical records (HIPAA compliant)                               │
│  ├─ Integrates with health data exports                                    │
│  └─ Enables interoperability with healthcare systems                       │
│                                                                             │
│  Comprehend Medical                                                         │
│  ├─ Analyzes symptom descriptions                                          │
│  ├─ Extracts medical entities (conditions, medications)                    │
│  ├─ Generates medical insights                                             │
│  └─ Stores insights in medicalInsights JSON field                          │
│                                                                             │
│  S3 (Simple Storage Service)                                                │
│  ├─ Stores birth plans (PDF)                                               │
│  ├─ Stores audio evidence from SOS alerts                                  │
│  └─ Stores user-generated documents                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                                    │
│                                                                             │
│  • Persists all user data                                                  │
│  • Maintains relationships between entities                                │
│  • Supports complex queries for analytics                                  │
│  • Indexed for performance optimization                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Domain-Specific Architectures

### 1. Health Tracking Domain

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEALTH TRACKING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User Input (Cycle, Symptom, Mood)
         ↓
CycleTracker / SymptomLogger / MoodTracker (Frontend)
         ↓
health.service.ts (API calls)
         ↓
health-lifecycle.controller.ts (Backend)
         ↓
Prisma ORM
         ↓
Database (Cycle, Symptom, Mood tables)
         ↓
Comprehend Medical (Optional: Extract insights)
         ↓
Store medicalInsights in JSON field
         ↓
Display insights to user
```

### 2. Safety & Emergency Domain

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFETY FLOW                                  │
└─────────────────────────────────────────────────────────────────┘

User Triggers SOS / SafeWalk
         ↓
SOSButton / SafeWalk (Frontend)
         ↓
safety.service.ts (API calls)
         ↓
safety.controller.ts (Backend)
         ↓
Create SOSAlert / SafeWalkSession in DB
         ↓
SNS (Send SMS to trusted contacts)
         ↓
S3 (Store audio evidence if available)
         ↓
Real-time location tracking (SafeWalk)
         ↓
Share token for public tracking link
```

### 3. Reminder & Notification Domain

```
┌─────────────────────────────────────────────────────────────────┐
│                    REMINDER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

User Creates Reminder
         ↓
Reminders (Frontend)
         ↓
reminder.controller.ts (Backend)
         ↓
Create Reminder in DB
         ↓
EventBridge (Create scheduled rule)
         ↓
Store EventBridgeRuleArn in DB
         ↓
[At scheduled time]
         ↓
EventBridge triggers Lambda (reminder-processor)
         ↓
Lambda queries DB for reminder details
         ↓
SNS sends SMS/Email notification
         ↓
User receives notification
```

### 4. AI Chat Domain

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI CHAT FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

User Message
         ↓
AIChat (Frontend)
         ↓
ai.service.ts (API calls)
         ↓
ai.controller.ts (Backend)
         ↓
Fetch user context (recent moods, symptoms, cycle)
         ↓
Google Generative AI (Gemini)
         ↓
Generate response with context
         ↓
Store ChatHistory in DB
         ↓
Return response to user
```

### 5. Community & Mentorship Domain

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMUNITY FLOW                               │
└─────────────────────────────────────────────────────────────────┘

User Posts Question
         ↓
QAForum (Frontend)
         ↓
community.service.ts (API calls)
         ↓
community.controller.ts (Backend)
         ↓
Create Question in DB
         ↓
Other users browse & answer
         ↓
Answers stored with upvotes
         ↓
Expert answers marked as verified
         ↓
Display Q&A with community engagement

Mentor Matching:
User Profile → MentorProfile → ExperienceTag
         ↓
MentorMatch (pending → accepted)
         ↓
MentorMessage (direct messaging)
```

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: React Hooks (useAuth, useHealthData, etc.)
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **PWA**: Service Worker (sw.js)

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Resend
- **PDF Generation**: PDFKit

### AWS Services
- **SNS**: Notifications (SMS, Email)
- **EventBridge**: Scheduled reminders
- **Lambda**: Serverless functions (period-alert, reminder-processor)
- **HealthLake**: Medical records storage
- **Comprehend Medical**: Medical text analysis
- **S3**: File storage (PDFs, audio)

### AI/ML
- **Google Generative AI**: Gemini for chat
- **AWS Comprehend Medical**: Medical insights extraction

### DevOps
- **Deployment**: Render (render.yaml)
- **Version Control**: Git
- **Package Manager**: npm
- **Task Runner**: Concurrently (dev mode)

---

## Key Features by Domain

### 1. Health Tracking
- Menstrual cycle tracking
- Symptom logging with medical insights
- Mood tracking with triggers
- Fertility tracking (BBT, ovulation tests)
- IVF cycle management
- Pregnancy companion (week-by-week)
- Postpartum support (EPDS, feeding, sleep)
- Menopause tracking (hot flashes)
- Grief journaling

### 2. Safety & Emergency
- SOS button with location & audio
- Safe walk tracking with public share link
- Trusted contacts management
- Anonymous incident reporting
- Crisis support resources

### 3. Mental Health
- AI chat companion (Gemini)
- Crisis keyword detection
- Therapist directory
- Resource pathways (country-specific)
- Burnout assessment

### 4. Legal & Financial
- Country-specific legal content
- Divorce rules & asset split calculators
- Financial goal tracking
- Salary benchmarks
- Career milestones

### 5. Community
- Q&A forum with expert answers
- Mentor matching by experience
- Mentor messaging
- Upvoting system

### 6. Reminders & Notifications
- Period alerts
- Medication reminders
- Custom reminders
- SMS/Email delivery
- EventBridge scheduling

---

## Database Relationships

```
User (1) ──→ (Many) Cycle
User (1) ──→ (Many) Symptom
User (1) ──→ (Many) Mood
User (1) ──→ (Many) Reminder
User (1) ──→ (Many) ChatHistory
User (1) ──→ (Many) TrustedContact
User (1) ──→ (Many) SOSAlert
User (1) ──→ (Many) SafeWalkSession
User (1) ──→ (Many) FertilityLog
User (1) ──→ (Many) IVFCycle
User (1) ──→ (Many) PregnancyLog
User (1) ──→ (Many) BirthPlan
User (1) ──→ (Many) ContractionLog
User (1) ──→ (Many) KickLog
User (1) ──→ (Many) EPDSAssessment
User (1) ──→ (Many) FeedingLog
User (1) ──→ (Many) BabySleepLog
User (1) ──→ (Many) HotFlashLog
User (1) ──→ (Many) GriefJournal
User (1) ──→ (Many) FinancialGoal
User (1) ──→ (Many) CareerMilestone
User (1) ──→ (Many) BurnoutAssessment
User (1) ──→ (1) MentorProfile
User (1) ──→ (1) ExpertProfile
User (1) ──→ (Many) Question
User (1) ──→ (Many) Answer
User (1) ──→ (Many) UpVote
User (1) ──→ (Many) UserFavouriteTherapist

Cycle (1) ──→ (Many) Symptom
MentorProfile (1) ──→ (Many) MentorMatch
MentorProfile (1) ──→ (Many) MentorMessage
MentorProfile (1) ──→ (Many) MentorProfileTag
ExperienceTag (1) ──→ (Many) MentorProfileTag
Question (1) ──→ (Many) Answer
Answer (1) ──→ (Many) UpVote
TherapistProfile (1) ──→ (Many) UserFavouriteTherapist
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER DEPLOYMENT                           │
└─────────────────────────────────────────────────────────────────┘

Frontend (React)
├─ Built with Vite
├─ Deployed as static site
└─ Served via CDN

Backend (Express + Node.js)
├─ Deployed as web service
├─ Auto-scaling enabled
└─ Environment variables configured

Database (PostgreSQL)
├─ Managed PostgreSQL instance
├─ Automated backups
└─ Connection pooling

AWS Services
├─ SNS (notifications)
├─ EventBridge (scheduling)
├─ Lambda (serverless functions)
├─ HealthLake (medical records)
├─ Comprehend Medical (insights)
└─ S3 (file storage)
```

---

## Security Considerations

1. **Authentication**: JWT tokens with secure storage
2. **Password**: bcryptjs hashing
3. **HTTPS**: All communications encrypted
4. **CORS**: Configured for frontend domain
5. **Rate Limiting**: Prevent brute force attacks
6. **Helmet**: Security headers
7. **Data Privacy**: HIPAA compliance with HealthLake
8. **Anonymous Reporting**: Incident reports without user ID
9. **Encryption**: Sensitive data encrypted at rest
10. **Audit Logging**: Track all critical operations

---

## Scalability Considerations

1. **Database**: PostgreSQL with connection pooling
2. **Caching**: Redis for session management (future)
3. **CDN**: Static assets via CDN
4. **Lambda**: Serverless for background jobs
5. **EventBridge**: Distributed scheduling
6. **Load Balancing**: Render auto-scaling
7. **Monitoring**: CloudWatch for AWS services
8. **Logging**: Centralized logging (future)

