# Implementation Plan: Health Tracking Application

## Overview

This implementation plan breaks down the health tracking application into 8 phases spanning 16 weeks. The approach follows a layered architecture: foundation setup, backend services, frontend UI, and finally testing/deployment. Each phase builds incrementally on previous work, with property-based tests validating correctness properties from the design document.

## Phase 1: Foundation & Authentication (Weeks 1-2)

- [-] 1.1 Set up backend project structure with Express, TypeScript, and Prisma
  - Initialize Node.js project with TypeScript configuration
  - Install and configure Express, Prisma, and development dependencies
  - Set up environment variables (.env.example, .env.local)
  - Create directory structure: src/controllers, src/services, src/middleware, src/utils
  - _Requirements: Design Section - Backend Service Layer Architecture_

- [~] 1.2 Configure PostgreSQL database and Prisma schema
  - Set up PostgreSQL connection via Prisma
  - Create Prisma schema with User, Cycle, Symptom, Mood, Reminder, ChatHistory models
  - Define relationships and indexes (userId, date fields)
  - Run initial migration
  - _Requirements: Design Section - Core Data Models_

- [~] 1.3 Implement password hashing and JWT utilities
  - Create utility functions for bcrypt hashing (10 salt rounds)
  - Create JWT token generation and validation functions
  - Set up token expiry (7 days)
  - _Requirements: Design Section - Authentication Flow, Property 1, Property 2_

- [~] 1.4 Implement Auth Service with signup and login
  - Create AuthService class with signup, login, validateToken, logout methods
  - Implement password validation (min 8 chars, uppercase, number)
  - Implement email uniqueness check
  - Add preconditions and postconditions per design
  - _Requirements: Design Section - Authentication Service, Property 1, Property 2, Property 3_

- [~] 1.5 Write property tests for Auth Service
  - **Property 1: Password Hashing Security** - Verify hashed password differs from input and is valid bcrypt
  - **Property 2: JWT Token Validity and Expiry** - Verify token is valid and expires in exactly 7 days
  - **Property 3: Token Validation and User Identity** - Verify valid tokens decode to correct user
  - _Requirements: Design Section - Correctness Properties 1, 2, 3_

- [~] 1.6 Create authentication endpoints (signup, login, logout, me)
  - POST /auth/signup with SignupRequest validation
  - POST /auth/login with LoginRequest validation
  - POST /auth/logout
  - GET /auth/me (protected)
  - Set HTTP-only cookies with secure flags
  - _Requirements: Design Section - Authentication Endpoints_

- [~] 1.7 Implement auth middleware and token verification
  - Create middleware to verify JWT from cookies or Authorization header
  - Attach user to request object
  - Return 401 for invalid/missing tokens
  - _Requirements: Design Section - Auth Middleware, Property 3_

- [~] 1.8 Set up input validation with Zod schemas
  - Create validation schemas for signup, login, all CRUD operations
  - Implement global error handler for validation errors
  - Return specific error messages per field
  - _Requirements: Design Section - Error Handling & Validation, Property 24_

- [~] 1.9 Configure security headers and CORS
  - Set up helmet for security headers (X-Frame-Options, X-Content-Type-Options, HSTS)
  - Configure CORS to whitelist frontend domain
  - Set up rate limiting (100 requests per 15 minutes)
  - _Requirements: Design Section - Security Considerations, Property 26, Property 27_

- [~] 1.10 Checkpoint - Verify authentication system
  - Ensure all auth tests pass
  - Test signup with valid/invalid data
  - Test login with correct/incorrect credentials
  - Test token validation and expiry
  - Ask user if questions arise


## Phase 2: Core Health Tracking Services (Weeks 3-4)

- [ ] 2.1 Implement Cycle Service with CRUD operations
  - Create CycleService class with createCycle, getUserCycles, updateCycle, deleteCycle, getCurrentCycle
  - Implement date validation (startDate ≤ endDate or endDate null)
  - Add cycle length and period length calculations
  - _Requirements: Design Section - Cycle Service, Property 4, Property 5_

- [ ] 2.2 Write property tests for Cycle Service
  - **Property 4: Cycle Date Ordering** - Verify startDate ≤ endDate or endDate is null
  - **Property 5: User Data Isolation in Cycles** - Verify all returned cycles belong to requested userId
  - _Requirements: Design Section - Correctness Properties 4, 5_

- [ ] 2.3 Create Cycle API endpoints (GET, POST, PATCH, DELETE)
  - GET /cycles - list all cycles for user
  - POST /cycles - create new cycle with validation
  - GET /cycles/:id - get cycle details
  - PATCH /cycles/:id - update cycle
  - DELETE /cycles/:id - delete cycle
  - _Requirements: Design Section - Cycle Endpoints_

- [ ] 2.4 Implement Symptom Service with logging and filtering
  - Create SymptomService class with logSymptom, getUserSymptoms, updateSymptom, deleteSymptom
  - Implement severity validation (1-10 range)
  - Implement date range filtering
  - _Requirements: Design Section - Symptom Service, Property 6, Property 7_

- [ ] 2.5 Write property tests for Symptom Service
  - **Property 6: Symptom Severity Range** - Verify severity is between 1-10 inclusive
  - **Property 7: Symptom Date Range Filtering** - Verify filtered symptoms are within date range
  - _Requirements: Design Section - Correctness Properties 6, 7_

- [ ] 2.6 Create Symptom API endpoints (GET, POST, PATCH, DELETE)
  - GET /symptoms - list symptoms with optional date range filter
  - POST /symptoms - log new symptom with validation
  - GET /symptoms/:id - get symptom details
  - PATCH /symptoms/:id - update symptom
  - DELETE /symptoms/:id - delete symptom
  - _Requirements: Design Section - Symptom Endpoints_

- [ ] 2.7 Implement Mood Service with tracking and analysis
  - Create MoodService class with logMood, getUserMoods, updateMood, deleteMood
  - Implement intensity validation (1-10 range)
  - Implement mood type validation (predefined types)
  - Implement date range filtering
  - _Requirements: Design Section - Mood Service, Property 8, Property 9, Property 10_

- [ ] 2.8 Write property tests for Mood Service
  - **Property 8: Mood Intensity Range** - Verify intensity is between 1-10 inclusive
  - **Property 9: Mood Type Validation** - Verify mood type is one of predefined types
  - **Property 10: Mood Date Range Filtering** - Verify filtered moods are within date range
  - _Requirements: Design Section - Correctness Properties 8, 9, 10_

- [ ] 2.9 Create Mood API endpoints (GET, POST, PATCH, DELETE)
  - GET /moods - list moods with optional date range filter
  - POST /moods - log new mood with validation
  - GET /moods/:id - get mood details
  - PATCH /moods/:id - update mood
  - DELETE /moods/:id - delete mood
  - _Requirements: Design Section - Mood Endpoints_

- [ ] 2.10 Add database indexes for performance optimization
  - Create indexes on userId for all health data tables
  - Create indexes on date fields for range queries
  - Verify query performance < 100ms
  - _Requirements: Design Section - Performance Optimization, Property 29, Property 30, Property 31_

- [ ] 2.11 Checkpoint - Verify health tracking services
  - Ensure all CRUD operations work correctly
  - Test date range filtering
  - Test data isolation between users
  - Verify query performance
  - Ask user if questions arise


## Phase 3: Reminders & Notifications (Weeks 5-6)

- [ ] 3.1 Implement Reminder Service with CRUD operations
  - Create ReminderService class with createReminder, getUserReminders, updateReminder, deleteReminder
  - Implement scheduled time validation (must be in future)
  - Implement active status default (true)
  - _Requirements: Design Section - Reminder Service, Property 11, Property 12, Property 13_

- [ ] 3.2 Write property tests for Reminder Service
  - **Property 11: Reminder Active Status Default** - Verify isActive defaults to true
  - **Property 12: Reminder Scheduled Time Validation** - Verify scheduled time is in future
  - **Property 13: User Data Isolation in Reminders** - Verify all returned reminders belong to userId and are active
  - _Requirements: Design Section - Correctness Properties 11, 12, 13_

- [ ] 3.3 Create Reminder API endpoints (GET, POST, PATCH, DELETE)
  - GET /reminders - list all active reminders for user
  - POST /reminders - create reminder with validation
  - GET /reminders/:id - get reminder details
  - PATCH /reminders/:id - update reminder and reschedule if needed
  - DELETE /reminders/:id - delete reminder and cancel scheduled job
  - _Requirements: Design Section - Reminder Endpoints_

- [ ] 3.4 Set up AWS SNS integration for SMS notifications
  - Configure AWS SDK with credentials
  - Create SNSNotificationService class
  - Implement sendSMSReminder method
  - Test SMS sending with test phone number
  - _Requirements: Design Section - SNS Integration_

- [ ] 3.5 Implement node-cron scheduling for reminders
  - Create scheduler to register cron jobs for each reminder
  - Implement scheduleReminder method in ReminderService
  - Implement cancelScheduledReminder method
  - Handle timezone-aware scheduling
  - _Requirements: Design Section - SNS Integration_

- [ ] 3.6 Implement period alert automation
  - Create daily cron job at 8 AM (user's timezone)
  - Check if user's cycle is starting today
  - Send SMS: "Your period is starting today. Track your symptoms in the app."
  - _Requirements: Design Section - SNS Integration_

- [ ] 3.7 Implement medication reminder scheduling
  - Create cron jobs for user-specified reminder times
  - Send SMS with medication name and reminder details
  - Handle recurring reminders (daily, weekly, monthly)
  - _Requirements: Design Section - SNS Integration_

- [ ] 3.8 Checkpoint - Verify reminders and notifications
  - Ensure reminders are created with correct scheduled times
  - Test SMS sending via SNS
  - Test cron job scheduling and execution
  - Verify period alerts trigger correctly
  - Ask user if questions arise


## Phase 4: AI Integration & Export (Weeks 7-8)

- [ ] 4.1 Implement AI Chat Service with context building
  - Create AIChatService class with chat, buildContext, getChatHistory methods
  - Implement context building from recent moods, symptoms, and current cycle
  - Integrate with OpenAI or Google Gemini API
  - _Requirements: Design Section - AI Chat Service, Property 14, Property 15_

- [ ] 4.2 Write property tests for AI Chat Service
  - **Property 14: AI Chat Response Non-Empty** - Verify responses are non-empty and contextually relevant
  - **Property 15: Chat History Sorting** - Verify chat history is sorted by date descending (most recent first)
  - _Requirements: Design Section - Correctness Properties 14, 15_

- [ ] 4.3 Create AI Chat API endpoint
  - POST /ai/chat - send message and receive AI response
  - Include context (recent moods, symptoms, current cycle) in request
  - Save chat history to database
  - Return ChatResponse with response and context
  - _Requirements: Design Section - AI Chat Endpoint_

- [ ] 4.4 Implement HealthLake Service for FHIR conversion
  - Create HealthLakeService class with exportHealthDataToFHIR method
  - Implement convertCycleToFHIR, convertSymptomToFHIR, convertMoodToFHIR methods
  - Ensure FHIR Observation and Condition resources are valid
  - _Requirements: Design Section - HealthLake Integration, Property 16, Property 17, Property 18_

- [ ] 4.5 Write property tests for HealthLake Service
  - **Property 16: FHIR Cycle Conversion** - Verify cycles convert to valid FHIR Observation resources
  - **Property 17: FHIR Symptom Conversion** - Verify symptoms convert to valid FHIR Condition resources
  - **Property 18: FHIR Mood Conversion** - Verify moods convert to valid FHIR Observation resources
  - _Requirements: Design Section - Correctness Properties 16, 17, 18_

- [ ] 4.6 Implement health data export functionality
  - Create export endpoint that aggregates user health data
  - Exclude raw chat history and personal notes
  - Convert to FHIR format
  - Send to AWS HealthLake
  - _Requirements: Design Section - HealthLake Integration, Property 19_

- [ ] 4.7 Write property test for data export exclusion
  - **Property 19: Health Data Export Exclusion** - Verify raw chat history and notes are excluded from export
  - _Requirements: Design Section - Correctness Property 19_

- [ ] 4.8 Checkpoint - Verify AI and export functionality
  - Test AI chat with various messages
  - Verify context is correctly included
  - Test FHIR conversion for all data types
  - Test health data export
  - Ask user if questions arise


## Phase 5: Frontend - Auth & Core UI (Weeks 9-10)

- [ ] 5.1 Set up React frontend project with Vite and TypeScript
  - Initialize Vite React project with TypeScript
  - Install dependencies: tailwindcss, radix-ui, framer-motion, react-query, axios, zod
  - Configure Tailwind CSS
  - Set up directory structure: src/components, src/screens, src/services, src/hooks, src/types
  - _Requirements: Design Section - Frontend Architecture_

- [ ] 5.2 Create authentication service and API client
  - Create axios instance with base URL and interceptors
  - Implement signup, login, logout API calls
  - Handle JWT tokens from cookies
  - Implement token refresh logic
  - _Requirements: Design Section - Authentication Endpoints_

- [ ] 5.3 Implement Login screen component
  - Create form with email and password fields
  - Add form validation with Zod
  - Display validation error messages per field
  - Handle loading state during submission
  - Redirect to dashboard on success
  - _Requirements: Design Section - Authentication Screens, Property 24_

- [ ] 5.4 Implement Signup screen component
  - Create form with email, password, firstName, lastName, dateOfBirth fields
  - Add password strength validation (8+ chars, uppercase, number)
  - Display validation error messages
  - Handle loading state
  - Redirect to dashboard on success
  - _Requirements: Design Section - Authentication Screens, Property 24_

- [ ] 5.5 Create Dashboard screen with summary cards
  - Display current cycle status
  - Show recent moods (last 7 days)
  - Show recent symptoms (last 7 days)
  - Show upcoming reminders
  - Use Card components from Radix UI
  - _Requirements: Design Section - Dashboard Screen_

- [ ] 5.6 Implement navigation and routing
  - Set up React Router with routes for all screens
  - Create protected routes that require authentication
  - Implement navigation menu/sidebar
  - Add logout functionality
  - _Requirements: Design Section - Frontend Architecture_

- [ ] 5.7 Implement dark/light mode toggle
  - Create theme context for dark/light mode
  - Add toggle button in navigation
  - Persist theme preference to database
  - Apply theme to all components
  - _Requirements: Design Section - Frontend Architecture, Property 23_

- [ ] 5.8 Write property test for theme persistence
  - **Property 23: Theme Preference Persistence** - Verify theme preference persists to database and applies on login
  - _Requirements: Design Section - Correctness Property 23_

- [ ] 5.9 Set up React Query for API caching
  - Configure React Query with default cache times
  - Create custom hooks for fetching cycles, symptoms, moods, reminders
  - Implement cache invalidation on mutations
  - _Requirements: Design Section - Performance Optimization, Property 32, Property 33, Property 34_

- [ ] 5.10 Write property tests for React Query caching
  - **Property 32: React Query Cache - Cycles** - Verify cycles cached for 5 minutes
  - **Property 33: React Query Cache - Moods** - Verify moods cached for 10 minutes
  - **Property 34: React Query Cache - Symptoms** - Verify symptoms cached for 10 minutes
  - _Requirements: Design Section - Correctness Properties 32, 33, 34_

- [ ] 5.11 Checkpoint - Verify frontend auth and core UI
  - Test signup and login flows
  - Verify dashboard displays correctly
  - Test navigation between screens
  - Test dark/light mode toggle
  - Ask user if questions arise


## Phase 6: Frontend - Health Tracking (Weeks 11-12)

- [ ] 6.1 Implement Cycle Tracker screen
  - Display list of cycles with start/end dates
  - Create form to add new cycle
  - Implement edit and delete functionality
  - Show current active cycle highlighted
  - Use Framer Motion for animations
  - _Requirements: Design Section - Cycle Tracker Screen_

- [ ] 6.2 Implement Symptom Logger screen
  - Display list of symptoms with date, type, severity
  - Create form to log new symptom with type dropdown
  - Implement severity slider (1-10)
  - Add date picker for symptom date
  - Implement edit and delete functionality
  - _Requirements: Design Section - Symptom Logger Screen, Property 6_

- [ ] 6.3 Implement Mood Tracker screen
  - Display list of moods with date, mood type, intensity
  - Create form to log new mood with mood type dropdown
  - Implement intensity slider (1-10)
  - Add triggers multi-select field
  - Implement edit and delete functionality
  - _Requirements: Design Section - Mood Tracker Screen, Property 8, Property 9_

- [ ] 6.4 Add date filtering and visualization
  - Implement date range picker for symptoms and moods
  - Filter displayed data based on selected date range
  - Show data counts and trends
  - Use charts/graphs to visualize patterns
  - _Requirements: Design Section - Symptom Logger Screen, Mood Tracker Screen, Property 7, Property 10_

- [ ] 6.5 Implement Reminder management screen
  - Display list of reminders with type, scheduled time, frequency
  - Create form to add new reminder
  - Implement edit and delete functionality
  - Show active/inactive status
  - _Requirements: Design Section - Reminder Endpoints_

- [ ] 6.6 Create reusable UI components
  - Card component with title and children
  - Button component with variants (primary, secondary, danger)
  - Input component with label, error display
  - Modal component with title, content, actions
  - DatePicker component
  - Slider component for severity/intensity
  - _Requirements: Design Section - UI Component Library_

- [ ] 6.7 Implement animations with Framer Motion
  - Page transitions (fade in/out, slide)
  - Card hover effects (scale, shadow)
  - Button tap feedback (scale down)
  - Loading skeleton shimmer animation
  - Chart animations (staggered children)
  - _Requirements: Design Section - Animation Specifications_

- [ ] 6.8 Write property test for cache invalidation
  - **Property 35: Cache Invalidation on Data Mutation** - Verify cache invalidates on create/update/delete
  - _Requirements: Design Section - Correctness Property 35_

- [ ] 6.9 Checkpoint - Verify health tracking UI
  - Test cycle tracker CRUD operations
  - Test symptom logger with date filtering
  - Test mood tracker with intensity validation
  - Test reminder management
  - Verify animations work smoothly
  - Ask user if questions arise


## Phase 7: Frontend - AI & PWA (Weeks 13-14)

- [ ] 7.1 Implement AI Chat Assistant screen
  - Display chat history with messages and responses
  - Create input field for user messages
  - Show loading state while waiting for AI response
  - Display context (recent moods, symptoms, current cycle)
  - Implement message scrolling and auto-scroll to latest
  - _Requirements: Design Section - AI Chat Assistant Screen, Property 14, Property 15_

- [ ] 7.2 Set up Service Worker for PWA support
  - Create service worker file
  - Register service worker in main app
  - Implement asset caching strategy
  - Cache essential assets (HTML, CSS, JS, fonts)
  - _Requirements: Design Section - PWA Support, Property 20_

- [ ] 7.3 Write property test for Service Worker caching
  - **Property 20: Service Worker Asset Caching** - Verify Service Worker registers and caches essential assets
  - _Requirements: Design Section - Correctness Property 20_

- [ ] 7.4 Implement offline support for read operations
  - Cache API responses in Service Worker
  - Serve cached data when offline
  - Display offline indicator
  - Allow viewing cycles, symptoms, moods while offline
  - _Requirements: Design Section - PWA Support, Property 21_

- [ ] 7.5 Write property test for offline read operations
  - **Property 21: Offline Read Operations** - Verify read operations succeed using cached data while offline
  - _Requirements: Design Section - Correctness Property 21_

- [ ] 7.6 Implement offline write operation queuing
  - Queue create/update/delete operations when offline
  - Store queued operations in IndexedDB
  - Sync queued operations when back online
  - Show sync status to user
  - _Requirements: Design Section - PWA Support, Property 22_

- [ ] 7.7 Write property test for offline write queuing
  - **Property 22: Offline Write Operation Queuing** - Verify write operations are queued for later sync
  - _Requirements: Design Section - Correctness Property 22_

- [ ] 7.8 Create PWA manifest and icons
  - Create manifest.json with app metadata
  - Generate app icons (192x192, 512x512)
  - Set theme colors and display mode
  - Enable "Add to Home Screen" functionality
  - _Requirements: Design Section - PWA Support_

- [ ] 7.9 Implement lazy loading for non-critical screens
  - Use React.lazy() for CycleTracker, SymptomLogger, AIChat screens
  - Implement Suspense boundaries with loading fallback
  - Verify non-critical screens not in initial bundle
  - _Requirements: Design Section - Performance Optimization, Property 36_

- [ ] 7.10 Write property test for lazy loading
  - **Property 36: Lazy Loading of Non-Critical Screens** - Verify non-critical screens lazy load and not in initial bundle
  - _Requirements: Design Section - Correctness Property 36_

- [ ] 7.11 Implement keyboard navigation and accessibility
  - Ensure all interactive elements are keyboard accessible
  - Support Tab and Enter key navigation
  - Add ARIA labels to all components
  - Use semantic HTML (button, input, form, etc.)
  - _Requirements: Design Section - Accessibility, Property 37, Property 38_

- [ ] 7.12 Write property tests for accessibility
  - **Property 37: Keyboard Navigation Accessibility** - Verify keyboard navigation works via Tab and Enter
  - **Property 38: ARIA Labels and Semantic HTML** - Verify ARIA labels and semantic HTML present
  - _Requirements: Design Section - Correctness Properties 37, 38_

- [ ] 7.13 Checkpoint - Verify AI and PWA functionality
  - Test AI chat with various messages
  - Test offline read operations
  - Test offline write queuing and sync
  - Test PWA installation
  - Test keyboard navigation
  - Ask user if questions arise


## Phase 8: Testing & Deployment (Weeks 15-16)

- [ ] 8.1 Write unit tests for Auth Service
  - Test signup with valid/invalid data
  - Test login with correct/incorrect credentials
  - Test token validation and expiry
  - Test password hashing
  - Test logout functionality
  - _Requirements: Design Section - Testing Strategy, Property 1, Property 2, Property 3_

- [ ] 8.2 Write unit tests for Cycle Service
  - Test cycle creation with valid/invalid dates
  - Test cycle retrieval and filtering
  - Test cycle updates and deletions
  - Test current cycle detection
  - _Requirements: Design Section - Testing Strategy, Property 4, Property 5_

- [ ] 8.3 Write unit tests for Symptom Service
  - Test symptom logging with valid/invalid severity
  - Test date range filtering
  - Test symptom updates and deletions
  - Test data isolation between users
  - _Requirements: Design Section - Testing Strategy, Property 6, Property 7_

- [ ] 8.4 Write unit tests for Mood Service
  - Test mood logging with valid/invalid intensity
  - Test mood type validation
  - Test date range filtering
  - Test mood updates and deletions
  - _Requirements: Design Section - Testing Strategy, Property 8, Property 9, Property 10_

- [ ] 8.5 Write unit tests for Reminder Service
  - Test reminder creation with future scheduled times
  - Test active status default
  - Test reminder scheduling and cancellation
  - Test data isolation between users
  - _Requirements: Design Section - Testing Strategy, Property 11, Property 12, Property 13_

- [ ] 8.6 Write unit tests for AI Chat Service
  - Test message processing
  - Test context building from user data
  - Test chat history retrieval and sorting
  - Test response generation
  - _Requirements: Design Section - Testing Strategy, Property 14, Property 15_

- [ ] 8.7 Write integration tests for complete workflows
  - Test signup → login → create cycle → log symptom → view dashboard
  - Test login → create reminder → receive SMS notification
  - Test login → chat with AI → verify context
  - Test export health data → verify FHIR format
  - _Requirements: Design Section - Testing Strategy_

- [ ] 8.8 Write frontend unit tests for components
  - Test Login/Signup screens with form validation
  - Test Dashboard screen rendering
  - Test Cycle Tracker CRUD operations
  - Test Symptom Logger with date filtering
  - Test Mood Tracker with intensity validation
  - _Requirements: Design Section - Testing Strategy_

- [ ] 8.9 Write frontend integration tests
  - Test complete user flows (signup → login → create data → view)
  - Test offline functionality
  - Test theme persistence
  - Test cache invalidation
  - _Requirements: Design Section - Testing Strategy_

- [ ] 8.10 Verify HTTP status codes and error handling
  - Test 401 for unauthorized requests
  - Test 403 for forbidden requests
  - Test 404 for not found resources
  - Test 500 for server errors
  - Test 429 for rate limit exceeded
  - _Requirements: Design Section - Error Handling, Property 25_

- [ ] 8.11 Write property tests for HTTP status codes
  - **Property 25: HTTP Status Code Correctness** - Verify appropriate status codes for all error scenarios
  - _Requirements: Design Section - Correctness Property 25_

- [ ] 8.12 Verify rate limiting enforcement
  - Test that 100+ requests in 15 minutes returns 429
  - Verify rate limit headers in response
  - Test rate limit reset
  - _Requirements: Design Section - Security Considerations, Property 26_

- [ ] 8.13 Write property test for rate limiting
  - **Property 26: Rate Limiting Enforcement** - Verify 429 returned for >100 requests in 15 minutes
  - _Requirements: Design Section - Correctness Property 26_

- [ ] 8.14 Verify security headers and SQL injection prevention
  - Test security headers present in all responses
  - Test SQL injection prevention with malicious inputs
  - Test CORS enforcement
  - _Requirements: Design Section - Security Considerations, Property 27, Property 28_

- [ ] 8.15 Write property tests for security
  - **Property 27: Security Headers Presence** - Verify security headers in all responses
  - **Property 28: SQL Injection Prevention** - Verify SQL injection attacks prevented
  - _Requirements: Design Section - Correctness Properties 27, 28_

- [ ] 8.16 Verify query performance benchmarks
  - Test cycle queries complete in < 100ms
  - Test symptom queries with date range in < 100ms
  - Test mood queries with date range in < 100ms
  - Verify database indexes are used
  - _Requirements: Design Section - Performance Optimization, Property 29, Property 30, Property 31_

- [ ] 8.17 Write property tests for query performance
  - **Property 29: Query Performance - Cycles** - Verify cycle queries < 100ms
  - **Property 30: Query Performance - Symptoms** - Verify symptom queries < 100ms
  - **Property 31: Query Performance - Moods** - Verify mood queries < 100ms
  - _Requirements: Design Section - Correctness Properties 29, 30, 31_

- [ ] 8.18 Deploy backend to Render or Railway
  - Set up production database on Supabase/Neon
  - Configure environment variables
  - Deploy Express backend
  - Set up CI/CD pipeline
  - Test production endpoints
  - _Requirements: Design Section - Deployment_

- [ ] 8.19 Deploy frontend to Vercel
  - Build React app with Vite
  - Configure Vercel deployment
  - Set up environment variables for API endpoint
  - Enable automatic deployments from git
  - Test production frontend
  - _Requirements: Design Section - Deployment_

- [ ] 8.20 Final checkpoint - Verify complete system
  - Run all unit tests
  - Run all integration tests
  - Run all property-based tests
  - Test complete user flows in production
  - Verify performance benchmarks
  - Ask user if questions arise
