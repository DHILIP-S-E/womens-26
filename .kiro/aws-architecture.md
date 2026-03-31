# AWS Architecture Diagram - Women's Health & Safety Platform

## Overview

This document describes the complete AWS architecture for the Women's Health & Safety Platform, a comprehensive health tracking and safety application built with React, Express.js, PostgreSQL, and AWS services.

---

## Architecture Layers

### 1. Client Layer
- **Web Browser**: React application (TypeScript)
- **Mobile App**: Progressive Web App (PWA)
- Both clients communicate via REST API

### 2. Content Delivery Layer
- **Route 53**: DNS routing and health checks
- **CloudFront**: CDN for static assets (React build, images, CSS)
- **S3 Bucket**: Static asset storage

### 3. API Gateway Layer
- **API Gateway**: REST API endpoint
- Handles request routing, rate limiting, authentication
- Integrates with backend services

### 4. Compute Layer

#### Backend Services (Auto-scaled)
- **EC2 Instances** (3+ instances): Express.js backend
  - Controllers for all domains (health, safety, career, etc.)
  - Prisma ORM for database operations
  - JWT authentication
  - Business logic processing

#### Serverless Functions (Lambda)
- **Period Alert Lambda**: Triggered by EventBridge, sends period predictions
- **Reminder Processor Lambda**: Processes scheduled reminders
- **AI Handler Lambda**: Processes AI requests (optional offloading)

### 5. Data Layer

#### Primary Database
- **RDS PostgreSQL**: Main application database
  - User profiles and authentication
  - Health tracking data (cycles, symptoms, moods)
  - Safety records (SOS alerts, safe walk sessions)
  - Community data (Q&A, mentorship)
  - Financial and career data
  - All other application data

#### Cache Layer
- **Redis**: Session management and caching
  - User sessions
  - Frequently accessed data
  - Rate limiting counters

#### Healthcare Data
- **HealthLake**: HIPAA-compliant medical records storage
  - Stores medical insights
  - Enables interoperability with healthcare systems
  - Secure medical data management

### 6. Storage Layer
- **S3 Bucket 1**: Documents and media
  - Birth plans (PDF)
  - Audio evidence from SOS alerts
  - User-generated documents
- **S3 Bucket 2**: Static assets
  - React build files
  - Images and icons
  - CSS and JavaScript bundles

### 7. Integration & Messaging Layer

#### EventBridge
- **Purpose**: Scheduled event processing
- **Use Cases**:
  - Period alert scheduling
  - Reminder scheduling (daily, weekly, monthly)
  - Recurring notification triggers
- **Triggers**: Lambda functions at scheduled times

#### SNS (Simple Notification Service)
- **Purpose**: Notification delivery
- **Channels**:
  - SMS notifications (period alerts, reminders)
  - Email notifications (via Resend integration)
  - Push notifications (Firebase)
- **Triggers**: Backend services, Lambda functions

#### SQS (Simple Queue Service)
- **Purpose**: Asynchronous message processing
- **Use Cases**:
  - Decoupling reminder processing
  - Batch processing of notifications
  - Reliable message delivery

### 8. AI & Analytics Layer

#### Comprehend Medical
- **Purpose**: Medical text analysis
- **Use Cases**:
  - Extract medical entities from symptom descriptions
  - Identify conditions and medications
  - Generate medical insights
  - Store insights in database

#### CloudWatch
- **Purpose**: Monitoring and logging
- **Metrics**:
  - API response times
  - Lambda execution duration
  - Database performance
  - Error rates
- **Logs**: Application logs, Lambda logs, API logs

### 9. Security Layer

#### IAM (Identity & Access Management)
- **Purpose**: Access control
- **Policies**:
  - EC2 instance roles
  - Lambda execution roles
  - S3 bucket policies
  - RDS access policies

#### Secrets Manager
- **Purpose**: Credential management
- **Secrets Stored**:
  - Database credentials
  - API keys (Google Generative AI, Resend)
  - JWT signing keys
  - AWS service credentials

### 10. External Services Integration

#### Google Generative AI (Gemini)
- **Purpose**: AI chat companion
- **Integration**: Backend calls Gemini API
- **Use Cases**:
  - Health advice chatbot
  - Mental health support
  - General Q&A

#### Resend
- **Purpose**: Email delivery
- **Use Cases**:
  - Transactional emails (password reset, verification)
  - Notification emails
  - Reminder emails

#### Firebase
- **Purpose**: Authentication and real-time features
- **Use Cases**:
  - Social login (Google, Facebook)
  - Real-time notifications
  - User authentication

---

## Data Flow Diagrams

### Health Data Tracking Flow
```
User Input (Cycle, Symptom, Mood)
    ↓
React Frontend (useHealthData hook)
    ↓
API Gateway → Backend EC2
    ↓
health.service.ts → health-lifecycle.controller.ts
    ↓
Prisma ORM
    ↓
RDS PostgreSQL (Cycle, Symptom, Mood tables)
    ↓
Comprehend Medical (Extract insights)
    ↓
Store medicalInsights in database
    ↓
Display to user via React
```

### Reminder & Notification Flow
```
User Creates Reminder
    ↓
API Gateway → Backend EC2
    ↓
reminder.controller.ts
    ↓
Create Reminder in RDS
    ↓
Create EventBridge Rule
    ↓
Store EventBridgeRuleArn in database
    ↓
[At scheduled time]
    ↓
EventBridge triggers reminder-processor Lambda
    ↓
Lambda queries RDS for reminder details
    ↓
Lambda publishes to SNS
    ↓
SNS sends SMS/Email via Resend
    ↓
User receives notification
```

### Safety Alert Flow
```
User Triggers SOS
    ↓
React Frontend (SOSButton)
    ↓
API Gateway → Backend EC2
    ↓
safety.controller.ts
    ↓
Create SOSAlert in RDS
    ↓
Publish to SNS
    ↓
SNS sends SMS to trusted contacts
    ↓
Upload audio evidence to S3
    ↓
Store S3 URL in database
    ↓
Real-time location tracking via SafeWalk
```

### AI Chat Flow
```
User Message
    ↓
React Frontend (AIChat)
    ↓
API Gateway → Backend EC2
    ↓
ai.controller.ts
    ↓
Fetch user context (moods, symptoms, cycle)
    ↓
Call Google Generative AI (Gemini)
    ↓
Generate response with context
    ↓
Store ChatHistory in RDS
    ↓
Return response to user
```

---

## Scalability & High Availability

### Auto-Scaling
- **EC2 Auto Scaling Group**: Scales backend instances based on CPU/memory
- **RDS Multi-AZ**: Database replication across availability zones
- **CloudFront**: Automatic scaling for CDN

### Load Balancing
- **API Gateway**: Distributes requests across backend instances
- **Route 53**: Health checks and failover

### Caching Strategy
- **CloudFront**: Caches static assets
- **Redis**: Caches sessions and frequently accessed data
- **RDS Query Cache**: Database query caching

### Database Optimization
- **Connection Pooling**: Managed by Prisma
- **Read Replicas**: For read-heavy operations
- **Indexes**: On frequently queried columns

---

## Security Best Practices

### Network Security
- **VPC**: Isolated network environment
- **Security Groups**: Firewall rules for EC2, RDS
- **API Gateway**: Rate limiting and throttling
- **WAF**: Web Application Firewall (optional)

### Data Security
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Encryption at Rest**: RDS encryption, S3 encryption
- **HealthLake**: HIPAA-compliant encryption
- **Secrets Manager**: Encrypted credential storage

### Access Control
- **IAM Roles**: Least privilege principle
- **JWT Authentication**: Secure token-based auth
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin request control

### Monitoring & Logging
- **CloudWatch**: Centralized logging
- **CloudTrail**: API audit logging
- **VPC Flow Logs**: Network traffic monitoring
- **Alerts**: Automated alerts for security events

---

## Cost Optimization

### Compute
- **EC2 Spot Instances**: For non-critical workloads
- **Lambda**: Pay-per-execution for serverless functions
- **Reserved Instances**: For predictable baseline load

### Storage
- **S3 Lifecycle Policies**: Archive old data to Glacier
- **RDS**: Right-sizing instance types
- **CloudFront**: Reduces origin bandwidth costs

### Data Transfer
- **CloudFront**: Reduces data transfer costs
- **VPC Endpoints**: Avoids internet gateway charges
- **S3 Transfer Acceleration**: Optional for large files

### Monitoring
- **AWS Cost Explorer**: Track spending
- **Budgets**: Set cost alerts
- **Trusted Advisor**: Optimization recommendations

---

## Disaster Recovery & Backup

### RDS Backup Strategy
- **Automated Backups**: Daily snapshots (35-day retention)
- **Multi-AZ**: Synchronous replication
- **Cross-Region Replication**: Optional for critical data

### S3 Backup Strategy
- **Versioning**: Enable S3 versioning
- **Cross-Region Replication**: Replicate to another region
- **Lifecycle Policies**: Archive old versions

### Lambda & Code
- **Git Repository**: Version control
- **CodePipeline**: Automated deployment
- **Infrastructure as Code**: CloudFormation/Terraform

### Recovery Time Objectives (RTO)
- **Database**: < 5 minutes (Multi-AZ failover)
- **Application**: < 10 minutes (Auto Scaling)
- **Static Assets**: < 1 minute (CloudFront)

---

## Compliance & Privacy

### HIPAA Compliance
- **HealthLake**: HIPAA-eligible service
- **Encryption**: All data encrypted
- **Access Logging**: Audit trail of data access
- **Data Residency**: Data stays in specified region

### GDPR Compliance
- **Data Retention**: Configurable retention policies
- **Right to Deletion**: Automated data deletion
- **Consent Management**: User consent tracking
- **Data Portability**: Export user data

### Data Privacy
- **Anonymous Incident Reports**: No user ID stored
- **Grief Journals**: Never exported (isPrivate = true)
- **Encryption**: All sensitive data encrypted
- **Access Control**: Role-based access

---

## Deployment Architecture

### CI/CD Pipeline
```
Git Push
    ↓
CodePipeline
    ↓
CodeBuild (Build & Test)
    ↓
CodeDeploy (Deploy to EC2)
    ↓
CloudFormation (Infrastructure updates)
    ↓
Production Environment
```

### Environment Stages
- **Development**: Local development with Docker
- **Staging**: Pre-production testing
- **Production**: Live environment with auto-scaling

### Deployment Strategy
- **Blue-Green Deployment**: Zero-downtime updates
- **Canary Deployment**: Gradual rollout
- **Rollback**: Automatic rollback on failure

---

## Monitoring & Alerting

### Key Metrics
- **API Response Time**: Target < 200ms
- **Error Rate**: Target < 0.1%
- **Database CPU**: Target < 70%
- **Lambda Duration**: Target < 5 seconds
- **SNS Delivery**: Target 99.9% success

### Alerts
- **High CPU**: EC2 or RDS CPU > 80%
- **High Error Rate**: API errors > 1%
- **Database Connection Pool**: > 80% utilized
- **Lambda Throttling**: Any throttling events
- **S3 Bucket Size**: Approaching quota

### Dashboards
- **Operations Dashboard**: System health overview
- **Application Dashboard**: API metrics and errors
- **Database Dashboard**: Query performance and connections
- **Cost Dashboard**: Spending and forecasts

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18+, TypeScript, Vite |
| Backend | Express.js, Node.js, TypeScript |
| Database | PostgreSQL (RDS), Redis |
| ORM | Prisma |
| Authentication | JWT, Firebase |
| API | REST (Express), API Gateway |
| Storage | S3 |
| Messaging | SNS, SQS, EventBridge |
| Compute | EC2, Lambda |
| Healthcare | HealthLake, Comprehend Medical |
| AI | Google Generative AI (Gemini) |
| CDN | CloudFront |
| DNS | Route 53 |
| Monitoring | CloudWatch |
| Security | IAM, Secrets Manager |
| Email | Resend |

---

## Next Steps

1. **Infrastructure as Code**: Convert to CloudFormation/Terraform
2. **Auto-Scaling Policies**: Define scaling thresholds
3. **Backup Strategy**: Implement automated backups
4. **Monitoring Setup**: Configure CloudWatch dashboards
5. **Security Audit**: Conduct security assessment
6. **Cost Optimization**: Review and optimize costs
7. **Disaster Recovery**: Test recovery procedures
8. **Documentation**: Update runbooks and playbooks

