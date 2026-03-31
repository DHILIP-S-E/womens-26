  # Implementation Plan: Health Tracking Application

## Overview

This implementation plan breaks down the health tracking application into 8 phases spanning 16 weeks. The approach follows a layered architecture: foundation setup, backend services, frontend UI, and finally testing/deployment. Each phase builds incrementally on previous work, with property-based tests validating correctness properties from the design document.

## Phase 1: Foundation & Authentication (Weeks 1-2)

- [x] 1.1 Set up backend project structure with Express, TypeScript, and Prisma
  - Initialize Node.js project with TypeScript configuration
  - Install and configure Express, Prisma, and development dependencies
  - Set up environment variables (.env.example, .env.local)
  - Create directory structure: src/controllers, src/services, src/middleware, src/utils
  - _Requirements: Design Section - Backend Service Layer Architecture_

- [x] 1.2 Configure PostgreSQL database and Prisma schema
  - Set up PostgreSQL connection via Prisma
  - Create Prisma schema with User, Cycle, Symptom, Mood, Reminder, ChatHistory models
  - Define relationships and indexes (userId, date fields)
  - Run initial migration
  - _Requirements: Design Section - Core Data Models_

- [x] 1.3 Implement password hashing and JWT utilities
  - Create utility functions for bcrypt hashing (10 salt rounds)
  - Create JWT token generation and validation functions
  - Set up token expiry (7 days)
  - _Requirements: Design Section - Authentication Flow, Property 1, Property 2_

- [x] 1.4 Implement Auth Service with signup and login
  - Create AuthService class with signup, login, validateToken, logout methods
  - Implement password validation (min 8 chars, uppercase, number)
  - Implement email uniqueness check
  - Add preconditions and postconditions per design
  - _Requirements: Design Section - Authentication Service, Property 1, Property 2, Property 3_

- [x] 1.5 Write property tests for Auth Service
  - **Property 1: Password Hashing Security** - Verify hashed password differs from input and is valid bcrypt
  - **Property 2: JWT Token Validity and Expiry** - Verify token is valid and expires in exactly 7 days
  - **Property 3: Token Validation and User Identity** - Verify valid tokens decode to correct user
  - _Requirements: Design Section - Correctness Properties 1, 2, 3_

- [x] 1.6 Create authentication endpoints (signup, login, logout, me)
  - POST /auth/signup with SignupRequest validation
  - POST /auth/login with LoginRequest validation
  - POST /auth/logout
  - GET /auth/me (protected)
  - Set HTTP-only cookies with secure flags
  - _Requirements: Design Section - Authentication Endpoints_

- [x] 1.7 Implement auth middleware and token verification
  - Create middleware to verify JWT from cookies or Authorization header
  - Attach user to request object
  - Return 401 for invalid/missing tokens
  - _Requirements: Design Section - Auth Middleware, Property 3_

- [x] 1.8 Set up input validation with Zod schemas
  - Create validation schemas for signup, login, all CRUD operations
  - Implement global error handler for validation errors
  - Return specific error messages per field
  - _Requirements: Design Section - Error Handling & Validation, Property 24_

- [x] 1.9 Configure security headers and CORS
  - Set up helmet for security headers (X-Frame-Options, X-Content-Type-Options, HSTS)
  - Configure CORS to whitelist frontend domain
  - Set up rate limiting (100 requests per 15 minutes)
  - _Requirements: Design Section - Security Considerations, Property 26, Property 27_

- [x] 1.10 Checkpoint - Verify authentication system
  - Ensure all auth tests pass
  - Test signup with valid/invalid data
  - Test login with correct/incorrect credentials
  - Test token validation and expiry
  - Ask user if questions arise


## Phase 2: Core Health Tracking Services (Weeks 3-4)

- [x] 2.1 Implement Cycle Service with CRUD operations
  - Create CycleService class with createCycle, getUserCycles, updateCycle, deleteCycle, getCurrentCycle
  - Implement date validation (startDate ≤ endDate or endDate null)
  - Add cycle length and period length calculations
  - _Requirements: Design Section - Cycle Service, Property 4, Property 5_

- [x] 2.2 Write property tests for Cycle Service
  - **Property 4: Cycle Date Ordering** - Verify startDate ≤ endDate or endDate is null
  - **Property 5: User Data Isolation in Cycles** - Verify all returned cycles belong to requested userId
  - _Requirements: Design Section - Correctness Properties 4, 5_

- [x] 2.3 Create Cycle API endpoints (GET, POST, PATCH, DELETE)
  - GET /cycles - list all cycles for user
  - POST /cycles - create new cycle with validation
  - GET /cycles/:id - get cycle details
  - PATCH /cycles/:id - update cycle
  - DELETE /cycles/:id - delete cycle
  - _Requirements: Design Section - Cycle Endpoints_

- [x] 2.4 Implement Symptom Service with logging and filtering
  - Create SymptomService class with logSymptom, getUserSymptoms, updateSymptom, deleteSymptom
  - Implement severity validation (1-10 range)
  - Implement date range filtering
  - _Requirements: Design Section - Symptom Service, Property 6, Property 7_

- [x] 2.5 Write property tests for Symptom Service
  - **Property 6: Symptom Severity Range** - Verify severity is between 1-10 inclusive
  - **Property 7: Symptom Date Range Filtering** - Verify filtered symptoms are within date range
  - _Requirements: Design Section - Correctness Properties 6, 7_

- [x] 2.6 Create Symptom API endpoints (GET, POST, PATCH, DELETE)
  - GET /symptoms - list symptoms with optional date range filter
  - POST /symptoms - log new symptom with validation
  - GET /symptoms/:id - get symptom details
  - PATCH /symptoms/:id - update symptom
  - DELETE /symptoms/:id - delete symptom
  - _Requirements: Design Section - Symptom Endpoints_

- [x] 2.7 Implement Mood Service with tracking and analysis
  - Create MoodService class with logMood, getUserMoods, updateMood, deleteMood
  - Implement intensity validation (1-10 range)
  - Implement mood type validation (predefined types)
  - Implement date range filtering
  - _Requirements: Design Section - Mood Service, Property 8, Property 9, Property 10_

- [x] 2.8 Write property tests for Mood Service
  - **Property 8: Mood Intensity Range** - Verify intensity is between 1-10 inclusive
  - **Property 9: Mood Type Validation** - Verify mood type is one of predefined types
  - **Property 10: Mood Date Range Filtering** - Verify filtered moods are within date range
  - _Requirements: Design Section - Correctness Properties 8, 9, 10_

- [x] 2.9 Create Mood API endpoints (GET, POST, PATCH, DELETE)
  - GET /moods - list moods with optional date range filter
  - POST /moods - log new mood with validation
  - GET /moods/:id - get mood details
  - PATCH /moods/:id - update mood
  - DELETE /moods/:id - delete mood
  - _Requirements: Design Section - Mood Endpoints_

- [x] 2.10 Add database indexes for performance optimization
  - Create indexes on userId for all health data tables
  - Create indexes on date fields for range queries
  - Verify query performance < 100ms
  - _Requirements: Design Section - Performance Optimization, Property 29, Property 30, Property 31_

- [x] 2.11 Checkpoint - Verify health tracking services
  - Ensure all CRUD operations work correctly
  - Test date range filtering
  - Test data isolation between users
  - Verify query performance
  - Ask user if questions arise


## Phase 3: Reminders & Notifications (Weeks 5-6)

- [x] 3.1 Implement Reminder Service with CRUD operations
  - Create ReminderService class with createReminder, getUserReminders, updateReminder, deleteReminder
  - Implement scheduled time validation (must be in future)
  - Implement active status default (true)
  - _Requirements: Design Section - Reminder Service, Property 11, Property 12, Property 13_

- [x] 3.2 Write property tests for Reminder Service
  - **Property 11: Reminder Active Status Default** - Verify isActive defaults to true
  - **Property 12: Reminder Scheduled Time Validation** - Verify scheduled time is in future
  - **Property 13: User Data Isolation in Reminders** - Verify all returned reminders belong to userId and are active
  - _Requirements: Design Section - Correctness Properties 11, 12, 13_

- [x] 3.3 Create Reminder API endpoints (GET, POST, PATCH, DELETE)
  - GET /reminders - list all active reminders for user
  - POST /reminders - create reminder with validation
  - GET /reminders/:id - get reminder details
  - PATCH /reminders/:id - update reminder and reschedule if needed
  - DELETE /reminders/:id - delete reminder and cancel scheduled job
  - _Requirements: Design Section - Reminder Endpoints_

- [x] 3.4 Set up AWS SNS integration for SMS notifications
  - Configure AWS SDK with credentials
  - Create SNSNotificationService class
  - Implement sendSMSReminder method
  - Test SMS sending with test phone number
  - _Requirements: Design Section - SNS Integration_

- [x] 3.5 Implement node-cron scheduling for reminders
  - Create scheduler to register cron jobs for each reminder
  - Implement scheduleReminder method in ReminderService
  - Implement cancelScheduledReminder method
  - Handle timezone-aware scheduling
  - _Requirements: Design Section - SNS Integration_

- [x] 3.6 Implement period alert automation
  - Create daily cron job at 8 AM (user's timezone)
  - Check if user's cycle is starting today
  - Send SMS: "Your period is starting today. Track your symptoms in the app."
  - _Requirements: Design Section - SNS Integration_

- [x] 3.7 Implement medication reminder scheduling
  - Create cron jobs for user-specified reminder times
  - Send SMS with medication name and reminder details
  - Handle recurring reminders (daily, weekly, monthly)
  - _Requirements: Design Section - SNS Integration_

- [x] 3.8 Checkpoint - Verify reminders and notifications
  - Ensure reminders are created with correct scheduled times
  - Test SMS sending via SNS
  - Test cron job scheduling and execution
  - Verify period alerts trigger correctly
  - Ask user if questions arise


## Phase 4: AI Integration & Export (Weeks 7-8)

- [x] 4.1 Implement AI Chat Service with context building
  - Create AIChatService class with chat, buildContext, getChatHistory methods
  - Implement context building from recent moods, symptoms, and current cycle
  - Integrate with OpenAI or Google Gemini API
  - _Requirements: Design Section - AI Chat Service, Property 14, Property 15_

- [x] 4.2 Write property tests for AI Chat Service
  - **Property 14: AI Chat Response Non-Empty** - Verify responses are non-empty and contextually relevant
  - **Property 15: Chat History Sorting** - Verify chat history is sorted by date descending (most recent first)
  - _Requirements: Design Section - Correctness Properties 14, 15_

- [x] 4.3 Create AI Chat API endpoint
  - POST /ai/chat - send message and receive AI response
  - Include context (recent moods, symptoms, current cycle) in request
  - Save chat history to database
  - Return ChatResponse with response and context
  - _Requirements: Design Section - AI Chat Endpoint_

- [x] 4.4 Implement HealthLake Service for FHIR conversion
  - Create HealthLakeService class with exportHealthDataToFHIR method
  - Implement convertCycleToFHIR, convertSymptomToFHIR, convertMoodToFHIR methods
  - Ensure FHIR Observation and Condition resources are valid
  - _Requirements: Design Section - HealthLake Integration, Property 16, Property 17, Property 18_

- [x] 4.5 Write property tests for HealthLake Service
  - **Property 16: FHIR Cycle Conversion** - Verify cycles convert to valid FHIR Observation resources
  - **Property 17: FHIR Symptom Conversion** - Verify symptoms convert to valid FHIR Condition resources
  - **Property 18: FHIR Mood Conversion** - Verify moods convert to valid FHIR Observation resources
  - _Requirements: Design Section - Correctness Properties 16, 17, 18_

- [x] 4.6 Implement health data export functionality
  - Create export endpoint that aggregates user health data
  - Exclude raw chat history and personal notes
  - Convert to FHIR format
  - Send to AWS HealthLake
  - _Requirements: Design Section - HealthLake Integration, Property 19_

- [x] 4.7 Write property test for data export exclusion
  - **Property 19: Health Data Export Exclusion** - Verify raw chat history and notes are excluded from export
  - _Requirements: Design Section - Correctness Property 19_

- [x] 4.8 Checkpoint - Verify AI and export functionality
  - Test AI chat with various messages
  - Verify context is correctly included
  - Test FHIR conversion for all data types
  - Test health data export
  - Ask user if questions arise


## Phase 5: Frontend - Auth & Core UI (Weeks 9-10)

- [x] 5.1 Set up React frontend project with Vite and TypeScript
  - Initialize Vite React project with TypeScript
  - Install dependencies: tailwindcss, radix-ui, framer-motion, react-query, axios, zod
  - Configure Tailwind CSS
  - Set up directory structure: src/components, src/screens, src/services, src/hooks, src/types
  - _Requirements: Design Section - Frontend Architecture_

- [x] 5.2 Create authentication service and API client
  - Create axios instance with base URL and interceptors
  - Implement signup, login, logout API calls
  - Handle JWT tokens from cookies
  - Implement token refresh logic
  - _Requirements: Design Section - Authentication Endpoints_

- [x] 5.3 Implement Login screen component
  - Create form with email and password fields
  - Add form validation with Zod
  - Display validation error messages per field
  - Handle loading state during submission
  - Redirect to dashboard on success
  - _Requirements: Design Section - Authentication Screens, Property 24_

- [x] 5.4 Implement Signup screen component
  - Create form with email, password, firstName, lastName, dateOfBirth fields
  - Add password strength validation (8+ chars, uppercase, number)
  - Display validation error messages
  - Handle loading state
  - Redirect to dashboard on success
  - _Requirements: Design Section - Authentication Screens, Property 24_

- [x] 5.5 Create Dashboard screen with summary cards
  - Display current cycle status
  - Show recent moods (last 7 days)
  - Show recent symptoms (last 7 days)
  - Show upcoming reminders
  - Use Card components from Radix UI
  - _Requirements: Design Section - Dashboard Screen_

- [x] 5.6 Implement navigation and routing
  - Set up React Router with routes for all screens
  - Create protected routes that require authentication
  - Implement navigation menu/sidebar
  - Add logout functionality
  - _Requirements: Design Section - Frontend Architecture_

- [x] 5.7 Implement dark/light mode toggle
  - Create theme context for dark/light mode
  - Add toggle button in navigation
  - Persist theme preference to database
  - Apply theme to all components
  - _Requirements: Design Section - Frontend Architecture, Property 23_

- [x] 5.8 Write property test for theme persistence
  - **Property 23: Theme Preference Persistence** - Verify theme preference persists to database and applies on login
  - _Requirements: Design Section - Correctness Property 23_

- [x] 5.9 Set up React Query for API caching
  - Configure React Query with default cache times
  - Create custom hooks for fetching cycles, symptoms, moods, reminders
  - Implement cache invalidation on mutations
  - _Requirements: Design Section - Performance Optimization, Property 32, Property 33, Property 34_

- [x] 5.10 Write property tests for React Query caching
  - **Property 32: React Query Cache - Cycles** - Verify cycles cached for 5 minutes
  - **Property 33: React Query Cache - Moods** - Verify moods cached for 10 minutes
  - **Property 34: React Query Cache - Symptoms** - Verify symptoms cached for 10 minutes
  - _Requirements: Design Section - Correctness Properties 32, 33, 34_

- [x] 5.11 Checkpoint - Verify frontend auth and core UI
  - Test signup and login flows
  - Verify dashboard displays correctly
  - Test navigation between screens
  - Test dark/light mode toggle
  - Ask user if questions arise


## Phase 6: Frontend - Health Tracking (Weeks 11-12)

- [x] 6.1 Implement Cycle Tracker screen
  - Display list of cycles with start/end dates
  - Create form to add new cycle
  - Implement edit and delete functionality
  - Show current active cycle highlighted
  - Use Framer Motion for animations
  - _Requirements: Design Section - Cycle Tracker Screen_

- [x] 6.2 Implement Symptom Logger screen
  - Display list of symptoms with date, type, severity
  - Create form to log new symptom with type dropdown
  - Implement severity slider (1-10)
  - Add date picker for symptom date
  - Implement edit and delete functionality
  - _Requirements: Design Section - Symptom Logger Screen, Property 6_

- [x] 6.3 Implement Mood Tracker screen
  - Display list of moods with date, mood type, intensity
  - Create form to log new mood with mood type dropdown
  - Implement intensity slider (1-10)
  - Add triggers multi-select field
  - Implement edit and delete functionality
  - _Requirements: Design Section - Mood Tracker Screen, Property 8, Property 9_

- [x] 6.4 Add date filtering and visualization
  - Implement date range picker for symptoms and moods
  - Filter displayed data based on selected date range
  - Show data counts and trends
  - Use charts/graphs to visualize patterns
  - _Requirements: Design Section - Symptom Logger Screen, Mood Tracker Screen, Property 7, Property 10_

- [x] 6.5 Implement Reminder management screen
  - Display list of reminders with type, scheduled time, frequency
  - Create form to add new reminder
  - Implement edit and delete functionality
  - Show active/inactive status
  - _Requirements: Design Section - Reminder Endpoints_

- [x] 6.6 Create reusable UI components
  - Card component with title and children
  - Button component with variants (primary, secondary, danger)
  - Input component with label, error display
  - Modal component with title, content, actions
  - DatePicker component
  - Slider component for severity/intensity
  - _Requirements: Design Section - UI Component Library_

- [x] 6.7 Implement animations with Framer Motion
  - Page transitions (fade in/out, slide)
  - Card hover effects (scale, shadow)
  - Button tap feedback (scale down)
  - Loading skeleton shimmer animation
  - Chart animations (staggered children)
  - _Requirements: Design Section - Animation Specifications_

- [x] 6.8 Write property test for cache invalidation
  - **Property 35: Cache Invalidation on Data Mutation** - Verify cache invalidates on create/update/delete
  - _Requirements: Design Section - Correctness Property 35_

- [x] 6.9 Checkpoint - Verify health tracking UI
  - Test cycle tracker CRUD operations
  - Test symptom logger with date filtering
  - Test mood tracker with intensity validation
  - Test reminder management
  - Verify animations work smoothly
  - Ask user if questions arise


## Phase 7: Frontend - AI & PWA (Weeks 13-14)

- [x] 7.1 Implement AI Chat Assistant screen
  - Display chat history with messages and responses
  - Create input field for user messages
  - Show loading state while waiting for AI response
  - Display context (recent moods, symptoms, current cycle)
  - Implement message scrolling and auto-scroll to latest
  - _Requirements: Design Section - AI Chat Assistant Screen, Property 14, Property 15_

- [x] 7.2 Set up Service Worker for PWA support
  - Create service worker file
  - Register service worker in main app
  - Implement asset caching strategy
  - Cache essential assets (HTML, CSS, JS, fonts)
  - _Requirements: Design Section - PWA Support, Property 20_

- [x] 7.3 Write property test for Service Worker caching
  - **Property 20: Service Worker Asset Caching** - Verify Service Worker registers and caches essential assets
  - _Requirements: Design Section - Correctness Property 20_

- [x] 7.4 Implement offline support for read operations
  - Cache API responses in Service Worker
  - Serve cached data when offline
  - Display offline indicator
  - Allow viewing cycles, symptoms, moods while offline
  - _Requirements: Design Section - PWA Support, Property 21_

- [x] 7.5 Write property test for offline read operations
  - **Property 21: Offline Read Operations** - Verify read operations succeed using cached data while offline
  - _Requirements: Design Section - Correctness Property 21_

- [x] 7.6 Implement offline write operation queuing
  - Queue create/update/delete operations when offline
  - Store queued operations in IndexedDB
  - Sync queued operations when back online
  - Show sync status to user
  - _Requirements: Design Section - PWA Support, Property 22_

- [x] 7.7 Write property test for offline write queuing
  - **Property 22: Offline Write Operation Queuing** - Verify write operations are queued for later sync
  - _Requirements: Design Section - Correctness Property 22_

- [x] 7.8 Create PWA manifest and icons
  - Create manifest.json with app metadata
  - Generate app icons (192x192, 512x512)
  - Set theme colors and display mode
  - Enable "Add to Home Screen" functionality
  - _Requirements: Design Section - PWA Support_

- [x] 7.9 Implement lazy loading for non-critical screens
  - Use React.lazy() for CycleTracker, SymptomLogger, AIChat screens
  - Implement Suspense boundaries with loading fallback
  - Verify non-critical screens not in initial bundle
  - _Requirements: Design Section - Performance Optimization, Property 36_

- [x] 7.10 Write property test for lazy loading
  - **Property 36: Lazy Loading of Non-Critical Screens** - Verify non-critical screens lazy load and not in initial bundle
  - _Requirements: Design Section - Correctness Property 36_

- [x] 7.11 Implement keyboard navigation and accessibility
  - Ensure all interactive elements are keyboard accessible
  - Support Tab and Enter key navigation
  - Add ARIA labels to all components
  - Use semantic HTML (button, input, form, etc.)
  - _Requirements: Design Section - Accessibility, Property 37, Property 38_

- [x] 7.12 Write property tests for accessibility
  - **Property 37: Keyboard Navigation Accessibility** - Verify keyboard navigation works via Tab and Enter
  - **Property 38: ARIA Labels and Semantic HTML** - Verify ARIA labels and semantic HTML present
  - _Requirements: Design Section - Correctness Properties 37, 38_

- [x] 7.13 Checkpoint - Verify AI and PWA functionality
  - Test AI chat with various messages
  - Test offline read operations
  - Test offline write queuing and sync
  - Test PWA installation
  - Test keyboard navigation
  - Ask user if questions arise


## Phase 8: Testing & Deployment (Weeks 15-16)

- [x] 8.1 Write unit tests for Auth Service
  - Test signup with valid/invalid data
  - Test login with correct/incorrect credentials
  - Test token validation and expiry
  - Test password hashing
  - Test logout functionality
  - _Requirements: Design Section - Testing Strategy, Property 1, Property 2, Property 3_

- [x] 8.2 Write unit tests for Cycle Service
  - Test cycle creation with valid/invalid dates
  - Test cycle retrieval and filtering
  - Test cycle updates and deletions
  - Test current cycle detection
  - _Requirements: Design Section - Testing Strategy, Property 4, Property 5_

- [x] 8.3 Write unit tests for Symptom Service
  - Test symptom logging with valid/invalid severity
  - Test date range filtering
  - Test symptom updates and deletions
  - Test data isolation between users
  - _Requirements: Design Section - Testing Strategy, Property 6, Property 7_

- [x] 8.4 Write unit tests for Mood Service
  - Test mood logging with valid/invalid intensity
  - Test mood type validation
  - Test date range filtering
  - Test mood updates and deletions
  - _Requirements: Design Section - Testing Strategy, Property 8, Property 9, Property 10_

- [x] 8.5 Write unit tests for Reminder Service
  - Test reminder creation with future scheduled times
  - Test active status default
  - Test reminder scheduling and cancellation
  - Test data isolation between users
  - _Requirements: Design Section - Testing Strategy, Property 11, Property 12, Property 13_

- [x] 8.6 Write unit tests for AI Chat Service
  - Test message processing
  - Test context building from user data
  - Test chat history retrieval and sorting
  - Test response generation
  - _Requirements: Design Section - Testing Strategy, Property 14, Property 15_

- [x] 8.7 Write integration tests for complete workflows
  - Test signup → login → create cycle → log symptom → view dashboard
  - Test login → create reminder → receive SMS notification
  - Test login → chat with AI → verify context
  - Test export health data → verify FHIR format
  - _Requirements: Design Section - Testing Strategy_

- [x] 8.8 Write frontend unit tests for components
  - Test Login/Signup screens with form validation
  - Test Dashboard screen rendering
  - Test Cycle Tracker CRUD operations
  - Test Symptom Logger with date filtering
  - Test Mood Tracker with intensity validation
  - _Requirements: Design Section - Testing Strategy_

- [x] 8.9 Write frontend integration tests
  - Test complete user flows (signup → login → create data → view)
  - Test offline functionality
  - Test theme persistence
  - Test cache invalidation
  - _Requirements: Design Section - Testing Strategy_

- [x] 8.10 Verify HTTP status codes and error handling
  - Test 401 for unauthorized requests
  - Test 403 for forbidden requests
  - Test 404 for not found resources
  - Test 500 for server errors
  - Test 429 for rate limit exceeded
  - _Requirements: Design Section - Error Handling, Property 25_

- [x] 8.11 Write property tests for HTTP status codes
  - **Property 25: HTTP Status Code Correctness** - Verify appropriate status codes for all error scenarios
  - _Requirements: Design Section - Correctness Property 25_

- [x] 8.12 Verify rate limiting enforcement
  - Test that 100+ requests in 15 minutes returns 429
  - Verify rate limit headers in response
  - Test rate limit reset
  - _Requirements: Design Section - Security Considerations, Property 26_

- [x] 8.13 Write property test for rate limiting
  - **Property 26: Rate Limiting Enforcement** - Verify 429 returned for >100 requests in 15 minutes
  - _Requirements: Design Section - Correctness Property 26_

- [x] 8.14 Verify security headers and SQL injection prevention
  - Test security headers present in all responses
  - Test SQL injection prevention with malicious inputs
  - Test CORS enforcement
  - _Requirements: Design Section - Security Considerations, Property 27, Property 28_

- [x] 8.15 Write property tests for security
  - **Property 27: Security Headers Presence** - Verify security headers in all responses
  - **Property 28: SQL Injection Prevention** - Verify SQL injection attacks prevented
  - _Requirements: Design Section - Correctness Properties 27, 28_

- [x] 8.16 Verify query performance benchmarks
  - Test cycle queries complete in < 100ms
  - Test symptom queries with date range in < 100ms
  - Test mood queries with date range in < 100ms
  - Verify database indexes are used
  - _Requirements: Design Section - Performance Optimization, Property 29, Property 30, Property 31_

- [x] 8.17 Write property tests for query performance
  - **Property 29: Query Performance - Cycles** - Verify cycle queries < 100ms
  - **Property 30: Query Performance - Symptoms** - Verify symptom queries < 100ms
  - **Property 31: Query Performance - Moods** - Verify mood queries < 100ms
  - _Requirements: Design Section - Correctness Properties 29, 30, 31_

- [x] 8.18 Deploy backend to Render or Railway
  - Set up production database on Supabase/Neon
  - Configure environment variables
  - Deploy Express backend
  - Set up CI/CD pipeline
  - Test production endpoints
  - _Requirements: Design Section - Deployment_

- [x] 8.19 Deploy frontend to Vercel
  - Build React app with Vite
  - Configure Vercel deployment
  - Set up environment variables for API endpoint
  - Enable automatic deployments from git
  - Test production frontend
  - _Requirements: Design Section - Deployment_

- [x] 8.20 Final checkpoint - Verify complete system
  - Run all unit tests
  - Run all integration tests
  - Run all property-based tests
  - Test complete user flows in production
  - Verify performance benchmarks
  - Ask user if questions arise


## Phase 9: AWS Advanced Integrations (Comprehend Medical + Lambda/EventBridge)

- [x] 9.1 Integrate AWS Comprehend Medical for symptom/mood analysis
  - Create ComprehendMedicalService (src/services/comprehend-medical.service.ts)
  - Call DetectEntitiesV2, InferICD10CM, InferRxNorm, InferSNOMEDCT APIs in parallel
  - Extract medical entities: conditions, medications, anatomy, symptoms, test/treatments
  - Return structured MedicalInsights with ICD-10, RxNorm, SNOMED codes
  - _Requirements: Design Section - AWS Integrations, Medical Entity Recognition_

- [x] 9.2 Add auto-analysis on symptom and mood creation
  - Modify SymptomService.logSymptom to trigger background Comprehend analysis (non-blocking)
  - Modify MoodService.logMood to trigger background Comprehend analysis with combined text
  - Store medicalInsights as Json? field on Symptom and Mood models
  - Background analysis runs fire-and-forget — does not block API response
  - _Requirements: Design Section - Comprehend Medical Integration_

- [x] 9.3 Add on-demand medical analysis endpoints
  - POST /symptoms/:id/analyze — synchronous re-analysis of symptom notes
  - POST /moods/:id/analyze — synchronous re-analysis of mood notes + triggers
  - Return updated record with medicalInsights populated
  - _Requirements: Design Section - Comprehend Medical Endpoints_

- [x] 9.4 Update Prisma schema for medical insights
  - Add medicalInsights Json? to Symptom model
  - Add medicalInsights Json? to Mood model
  - Add eventBridgeRuleArn String? to Reminder model
  - Run Prisma migration
  - _Requirements: Design Section - Core Data Models_

- [x] 9.5 Create AWS Lambda functions for serverless reminders
  - Create lambda/reminder-processor/index.ts — processes individual reminder notifications
  - Create lambda/period-alert/index.ts — daily check for periods starting today
  - Create lambda/shared/db.ts — shared Prisma client for Lambda
  - Create lambda/shared/sns.ts — shared SNS helper for Lambda
  - Add try/catch error boundaries to both handlers
  - One-time reminders self-cleanup EventBridge rules after firing
  - _Requirements: Design Section - Lambda Integration_

- [x] 9.6 Create EventBridge service for rule management
  - Create EventBridgeService (src/services/eventbridge.service.ts)
  - Implement upsertReminderRule — creates/updates per-reminder EventBridge scheduled rules
  - Implement deleteReminderRule — removes rules and targets when reminders are deleted/deactivated
  - Implement ensurePeriodAlertRule — idempotent daily 8 AM UTC rule on startup
  - Convert frequency + scheduledTime to EventBridge cron(min hr dom mon dow yr) format
  - Handle default bus name correctly (omit EventBusName for default bus)
  - _Requirements: Design Section - EventBridge Integration_

- [x] 9.7 Migrate ReminderService from node-cron to EventBridge
  - Remove node-cron dependency and all in-memory scheduling (scheduledJobs Map)
  - Remove startPeriodAlertCron static method
  - Replace scheduleReminder/cancelScheduledReminder with EventBridge delegation
  - Update createReminder, updateReminder, deleteReminder to call EventBridgeService
  - Update index.ts — replace startPeriodAlertCron with ensurePeriodAlertRule on startup
  - Move dotenv.config() before all imports to ensure DATABASE_URL is available
  - _Requirements: Design Section - Reminder Service Refactor_

- [x] 9.8 Create Terraform infrastructure for AWS resources
  - Create terraform/main.tf — AWS provider, data sources
  - Create terraform/variables.tf — region, project name, database URL, environment
  - Create terraform/iam.tf — Lambda execution role + Express app IAM user with policies
  - Create terraform/lambda.tf — both Lambda functions with zip packaging
  - Create terraform/eventbridge.tf — period-alert-daily rule + Lambda permissions
  - Create terraform/outputs.tf — Lambda ARNs, IAM credentials, .env.local snippet
  - IAM policies: SNS, Comprehend Medical (4 actions), EventBridge, Lambda, HealthLake, CloudWatch Logs
  - _Requirements: Design Section - Deployment, Infrastructure as Code_

- [x] 9.9 Deploy and verify all AWS integrations
  - Build Lambda packages with slim node_modules (exclude AWS SDK, prune Prisma)
  - Run terraform apply — deploy 19 AWS resources
  - Update .env.local with Terraform outputs (IAM credentials, Lambda ARNs)
  - Verify all 5 AWS services connected: Comprehend Medical, EventBridge, Lambda, SNS, HealthLake
  - _Requirements: Design Section - AWS Integrations Verification_

- [x] 9.10 Test all endpoints end-to-end
  - Fix dotenv load order (must run before imports for database connection)
  - Fix SSL configuration for Render PostgreSQL (ssl: { rejectUnauthorized: false })
  - Test signup, login, cycle creation, symptom logging, mood logging
  - Test Comprehend Medical: symptom analysis returns ICD-10/RxNorm/SNOMED codes
  - Test Comprehend Medical: mood analysis detects anxiety (F41.9), headache (G44.209)
  - Verify all 11 API endpoints return correct data
  - _Requirements: Design Section - Testing Strategy_

- [x] 9.11 Checkpoint - Verify AWS advanced integrations
  - All 5 AWS services connected and tested
  - Comprehend Medical auto-analyzes symptom/mood notes
  - Lambda functions deployed and configured
  - EventBridge manages reminder scheduling
  - Terraform manages all infrastructure
  - All API endpoints tested end-to-end


## Phase 10: Safety & Emergency (Weeks 17-18)

- [ ] 10.1 Implement SOS panic button service
  - Create SafetyService with triggerSOS method
  - Integrate AWS Location Service for GPS coordinates
  - Record 30-second audio clip via MediaRecorder API
  - Upload audio to S3 with private ACL
  - Send SMS to all trusted contacts within 10 seconds
  - Call emergency services number for user's country
  - _Requirements: Design Section - Domain 1, Property 68_

- [ ] 10.2 Implement safe walk live location sharing
  - Create SafeWalkService with startSafeWalk, updateLocation, markArrived methods
  - Share GPS coordinates every 30 seconds to trusted contacts
  - Generate public tracking link for contacts (no app install needed)
  - Set expected arrival time
  - Auto-SOS fires if arrival time passes without confirmation
  - Lambda checks every 5 minutes via EventBridge
  - _Requirements: Design Section - Domain 1, Property 69_

- [ ] 10.3 Implement escape plan with client-side encryption
  - Create EscapePlan model stored only in IndexedDB
  - Implement AES-256 encryption using Web Crypto API
  - Zero server calls for escape plan read/write
  - Implement decoy screen (shows "recipe app" on home button press)
  - Decoy screen activates within 200ms
  - _Requirements: Design Section - Domain 1, Property 70_

- [ ] 10.4 Implement street harassment incident reporter
  - Create IncidentReport model with null userId (anonymous)
  - Auto-fill location from AWS Location Service
  - Incident types: catcalling, following, assault, other
  - Severity scale 1-5
  - Build safety heatmap from aggregated reports
  - Push notification when entering high-incident area
  - _Requirements: Design Section - Domain 1, Property 71_

- [ ] 10.5 Create safety domain API endpoints
  - POST /safety/sos - trigger panic button
  - POST /safety/safe-walk/start - start safe walk session
  - GET /safety/safe-walk/:sessionId - get session details
  - POST /safety/safe-walk/:sessionId/arrived - mark arrived
  - POST /safety/incident-report - report incident
  - GET /safety/incident-heatmap - get safety heatmap
  - _Requirements: Design Section - Domain 1 Endpoints_

- [ ] 10.6 Checkpoint - Verify safety features
  - Test SOS panic button with SMS delivery
  - Test safe walk location tracking
  - Test escape plan encryption and decoy screen
  - Test incident reporting and heatmap
  - Verify all features work offline where applicable

## Phase 11: Full Health Lifecycle (Weeks 19-20)

- [ ] 11.1 Implement fertility & IVF journey tracker
  - Create FertilityLog and IVFCycle models
  - Implement BBT charting (35.0-42.0°C validation)
  - Implement ovulation test result logging
  - Implement IVF stage tracker with valid sequence validation
  - Medication injection reminders via SNS
  - Emotional check-in after each milestone
  - _Requirements: Design Section - Domain 2, Property 72_

- [ ] 11.2 Implement pregnancy week-by-week companion
  - Create PregnancyWeek model (seeded dynamically, not hardcoded)
  - Create 40-week guide with fetal development, body changes, nutrition, warning signs
  - Implement appointment tracker with SNS reminders
  - Implement contraction timer (ContractionLog model)
  - Implement birth plan builder exported as PDF to S3
  - Implement kick counter with alert if no movement in 12 hours (weeks 28+)
  - _Requirements: Design Section - Domain 2, Property 73_

- [ ] 11.3 Implement postpartum recovery & mental health hub
  - Create EPDSAssessment model (Edinburgh Postnatal Depression Scale)
  - Implement EPDS screening every 2 weeks via push notification
  - Create FeedingLog model (feeding times, duration, side, latch rating)
  - Create BabySleepLog model
  - If EPDS score ≥ 10: immediate crisis resources + option to alert trusted contact
  - Connect to postpartum Circle (anonymous peer support)
  - _Requirements: Design Section - Domain 2, Property 74_

- [ ] 11.4 Implement menopause symptom management centre
  - Create HotFlashLog model (time, duration, severity, trigger log)
  - Create brain fog journal and sleep disruption log
  - Create HRT information guide (stored in DB, admin-updated)
  - Implement specialist menopause clinic finder by country
  - Implement symptom severity chart over time
  - Generate doctor report with Comprehend ICD-10 N95.x codes
  - _Requirements: Design Section - Domain 2, Property 75_

- [ ] 11.5 Implement miscarriage & pregnancy loss grief companion
  - Create GriefJournal model (private flag, never exported)
  - Implement validated grief stage tracker
  - Create "What happens next" medical guide (D&C, natural, medication options)
  - Create employer letter templates for time off
  - Implement due date memorial reminder (opt-in)
  - Connect to anonymous pregnancy loss Circle
  - Ensure GriefJournal excluded from ALL exports, FHIR, doctor reports, AI context
  - _Requirements: Design Section - Domain 2, Property 76_

- [ ] 11.6 Create health lifecycle API endpoints
  - POST /health/fertility/log - log fertility data
  - GET /health/fertility/logs - get fertility logs
  - POST /health/ivf/cycle - create IVF cycle
  - PATCH /health/ivf/cycle/:id - update IVF stage
  - GET /health/pregnancy/week/:weekNumber - get pregnancy week
  - POST /health/pregnancy/kick-log - log kick count
  - POST /health/postpartum/epds-assessment - submit EPDS
  - POST /health/menopause/hot-flash - log hot flash
  - POST /health/grief-journal - create grief entry
  - _Requirements: Design Section - Domain 2 Endpoints_

- [ ] 11.7 Checkpoint - Verify health lifecycle features
  - Test fertility tracking with BBT validation
  - Test pregnancy companion with week content
  - Test EPDS assessment with crisis resource display
  - Test menopause tracking and HRT info
  - Test grief journal exclusion from exports

## Phase 12: Mental Health (Weeks 21-22)

- [ ] 12.1 Implement mental health crisis detection & response
  - Integrate Comprehend DetectSentiment for journal entries and AI chat
  - Detect NEGATIVE sentiment with confidence > 0.85
  - Match against crisis keyword list (suicide, hopeless, can't go on)
  - Surface crisis resources overlay immediately
  - One-tap to call local crisis line (number stored by country in DB)
  - One-tap to alert trusted contact
  - Never label user as "at risk" in visible UI
  - _Requirements: Design Section - Domain 3, Property 77_

- [ ] 12.2 Implement therapy & specialist matching directory
  - Create TherapistProfile model (speciality, country, language, online/in-person, cost range)
  - Create UserFavouriteTherapist model
  - Implement filtering by speciality, country, language, online/in-person, cost
  - User saves favourites
  - One-tap to book via external link
  - Admin-managed via API — no hardcoded provider data
  - _Requirements: Design Section - Domain 3, Property 78_

- [ ] 12.3 Implement domestic abuse detection & support pathway
  - Integrate AWS Lex bot trained on abuse recognition patterns
  - Detect controlling behaviour, financial abuse, isolation patterns
  - Never label user — gently offer "Would you like to see some resources?"
  - Create ResourcePathway model (country-specific shelters, hotlines, legal aid)
  - All resources admin-managed in DB
  - _Requirements: Design Section - Domain 3, Property 79_

- [ ] 12.4 Create mental health API endpoints
  - POST /mental-health/journal-entry - log journal with crisis detection
  - POST /mental-health/chat - AI chat with crisis detection
  - GET /mental-health/therapists - search therapists
  - POST /mental-health/therapists/:id/favorite - save favourite
  - GET /mental-health/therapists/favorites - get favourites
  - POST /mental-health/abuse-detection - detect abuse patterns
  - GET /mental-health/resources - get support resources
  - _Requirements: Design Section - Domain 3 Endpoints_

- [ ] 12.5 Checkpoint - Verify mental health features
  - Test crisis detection with Comprehend sentiment
  - Test therapist directory filtering
  - Test abuse detection without labeling user
  - Test resource pathway display

## Phase 13: Legal Rights & Financial Independence (Weeks 23-24)

- [ ] 13.1 Implement legal rights knowledge base by country
  - Create LegalContent model (country, category, content, language)
  - Admin-managed via API
  - AWS Translate auto-translates to user's language
  - AI coach answers "what are my rights if..." using RAG with Bedrock/Gemini
  - Zero legal text hardcoded
  - _Requirements: Design Section - Domain 4, Property 80_

- [ ] 13.2 Implement divorce & separation financial survival toolkit
  - Create DivorceRule model (country, ruleType, formula)
  - Create DivorceSession model
  - Asset calculator (what you are entitled to)
  - Hidden asset checklist
  - Child support estimator by country
  - Document checklist generator
  - Lawyer cost estimator
  - Export checklist as PDF to S3
  - AI coach answers divorce questions using legal knowledge base
  - _Requirements: Design Section - Domain 4, Property 81_

- [ ] 13.3 Implement financial independence tracker
  - Create FinancialGoal model (emergency fund, hidden savings, investment)
  - Emergency fund goal tracker
  - Hidden savings account guide
  - Budget designed around women's unique challenges
  - Weekly Lambda checks progress and sends motivational SNS push
  - AI coach gives financial tips using cycle phase context
  - _Requirements: Design Section - Domain 4, Property 82_

- [ ] 13.4 Create legal & financial API endpoints
  - GET /legal/rights - get legal content by country/category
  - POST /legal/ask-coach - ask legal coach question
  - POST /legal/divorce/session - create divorce session
  - POST /legal/divorce/export-checklist - export checklist as PDF
  - POST /financial/goal - create financial goal
  - GET /financial/goals - get all goals
  - POST /financial/advice - get cycle-aware financial advice
  - _Requirements: Design Section - Domain 4 Endpoints_

- [ ] 13.5 Checkpoint - Verify legal & financial features
  - Test legal content serving from DB
  - Test divorce calculations per country
  - Test financial goal tracking
  - Test cycle-aware advice

## Phase 14: Career & Life Stages (Weeks 25-26)

- [ ] 14.1 Implement salary negotiation & career advocacy coach
  - Create SalaryBenchmark model (country, jobTitle, experience, salary range)
  - Create CareerMilestone model
  - Mock negotiation conversation via Bedrock/Gemini
  - Track career milestones, promotion dates, pay rise history
  - Generate "evidence pack" PDF for performance reviews
  - _Requirements: Design Section - Domain 5, Property 83_

- [ ] 14.2 Implement widowhood transition guide
  - Create WidowhoodStep model (country, step-by-step checklist)
  - Bank account steps, will and probate guide, benefits to claim, utility transfers
  - AI coach answers "what do I do next" questions
  - Connect to grief Circle
  - Sensitive tone enforced via Gemini system prompt stored in DB
  - _Requirements: Design Section - Domain 5, Property 84_

- [ ] 14.3 Implement caregiver burnout monitor
  - Create BurnoutAssessment model (Maslach Burnout Inventory — 3 questions)
  - Create BurnoutQuestion model (DB-driven questions, not hardcoded)
  - Create AssessmentRule model (scoring formula in DB)
  - Weekly validated burnout assessment via push notification
  - Score tracked over time
  - If burnout score crosses threshold: alert trusted contact (opt-in)
  - Surface respite care resources (DB-stored by country)
  - Connect to caregiver Circle
  - _Requirements: Design Section - Domain 5, Property 85_

- [ ] 14.4 Create career & life stages API endpoints
  - GET /career/salary-benchmark - get salary benchmark
  - POST /career/negotiation-practice - practice negotiation
  - POST /career/milestone - log career milestone
  - POST /career/evidence-pack - generate evidence pack PDF
  - GET /career/widowhood-guide - get widowhood steps
  - POST /career/widowhood-ask - ask widowhood coach
  - POST /career/burnout-assessment - submit burnout assessment
  - GET /career/burnout-resources - get respite care resources
  - _Requirements: Design Section - Domain 5 Endpoints_

- [ ] 14.5 Checkpoint - Verify career & life stages features
  - Test salary benchmark serving from DB
  - Test negotiation practice with Gemini
  - Test widowhood guide with sensitive tone
  - Test burnout assessment with threshold alerts

## Phase 15: Community & Mentorship (Weeks 27-28)

- [ ] 15.1 Implement peer mentorship matching
  - Create MentorProfile model (bio, experienceTags, isAnonymous)
  - Create ExperienceTag model
  - Create MentorMatch model
  - Matching algorithm: overlap of ExperienceTag between mentor and mentee
  - Messaging via AWS Chime SDK (or simple DB-backed message thread)
  - All voluntary, opt-in, anonymous option available
  - _Requirements: Design Section - Domain 6, Property 86_

- [ ] 15.2 Implement expert-verified Q&A knowledge base
  - Create Question, Answer, ExpertProfile, UpVote models
  - Women submit health and legal questions
  - Expert users (doctors, lawyers — verified via ExpertProfile) answer
  - Upvoting system
  - AI coach uses top-rated Q&A answers as additional RAG context
  - Admin verifies expert credentials via admin API
  - Questions moderated by Comprehend toxicity check
  - Only ExpertProfile-verified users may post expert answers
  - _Requirements: Design Section - Domain 6, Property 87_

- [ ] 15.3 Implement women's resource map by location
  - Create ResourceLocation model (type, name, address, lat, lng, country, phone)
  - Interactive map showing nearest: women's shelters, free legal aid clinics, menopause specialists, fertility clinics, postpartum support groups, food banks
  - AWS Location Service renders map
  - User's location used to find nearest 5 resources of each type
  - All locations stored in DB, admin-managed
  - _Requirements: Design Section - Domain 6, Property 88_

- [ ] 15.4 Create community & mentorship API endpoints
  - POST /community/mentor-profile - create mentor profile
  - GET /community/mentor-matches - get mentor matches
  - POST /community/mentor-message - send mentor message
  - GET /community/mentor-messages/:matchId - get messages
  - POST /community/question - submit question
  - POST /community/answer - submit answer
  - GET /community/questions - get questions
  - POST /community/answer/:id/upvote - upvote answer
  - GET /community/resources - get nearby resources
  - GET /community/resources/map - get resource map
  - _Requirements: Design Section - Domain 6 Endpoints_

- [ ] 15.5 Checkpoint - Verify community & mentorship features
  - Test mentor matching with shared tags
  - Test expert verification for Q&A
  - Test resource map with AWS Location Service
  - Test all community features end-to-end

## Phase 16: Integration & Final Testing (Weeks 29-30)

- [ ] 16.1 Write unit tests for all new domain services
  - Test SafetyService, FertilityService, PregnancyService, PostpartumService
  - Test MenopauseService, GriefService, CrisisDetectionService
  - Test TherapistService, AbuseDetectionService, LegalService
  - Test DivorceService, FinancialService, CareerService
  - Test WidowhoodService, BurnoutService, MentorshipService
  - Test QAService, ResourceMapService
  - _Requirements: Design Section - Testing Strategy_

- [ ] 16.2 Write integration tests for all new domains
  - Test complete workflows for each domain
  - Test cross-domain interactions (e.g., crisis detection → therapy matching)
  - Test data isolation between users
  - Test admin API for content management
  - _Requirements: Design Section - Testing Strategy_

- [ ] 16.3 Write property-based tests for new correctness properties
  - Test Properties 68-88 with fast-check
  - Verify all new features conform to correctness properties
  - _Requirements: Design Section - Correctness Properties 68-88_

- [ ] 16.4 Update frontend with new screens for all domains
  - Create screens for safety features (SOS, safe walk, escape plan, incident report)
  - Create screens for health lifecycle (fertility, pregnancy, postpartum, menopause, grief)
  - Create screens for mental health (crisis resources, therapist directory, abuse support)
  - Create screens for legal & financial (legal rights, divorce toolkit, financial goals)
  - Create screens for career & life stages (salary coach, widowhood guide, burnout monitor)
  - Create screens for community (mentorship, Q&A, resource map)
  - _Requirements: Design Section - Frontend Architecture_

- [ ] 16.5 Deploy all new features to production
  - Build and deploy backend with all new services
  - Build and deploy frontend with all new screens
  - Run all tests in production environment
  - Verify all 6 domains working end-to-end
  - _Requirements: Design Section - Deployment_

- [ ] 16.6 Final checkpoint - Verify complete system
  - Run all unit tests
  - Run all integration tests
  - Run all property-based tests
  - Test complete user flows for all 6 domains
  - Verify performance benchmarks
  - Verify security and data isolation
  - Ask user if questions arise
