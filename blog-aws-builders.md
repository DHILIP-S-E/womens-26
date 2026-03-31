# Building a Full-Stack Women's Safety & Health Platform with AWS Services

**Author:** [Your Name]
**Published on:** AWS Community Builders Blog
**Tags:** AWS Lambda, EventBridge, Comprehend Medical, HealthLake, SNS, Terraform, Full-Stack, Serverless, Healthcare

---

## Introduction

Women's safety and healthcare remain critical challenges worldwide. From tracking reproductive health across life stages to providing emergency SOS alerts, the need for a comprehensive, secure, and intelligent platform has never been greater.

In this post, I walk you through how I built **Women's Safety** -- a full-stack platform that combines reproductive health tracking, emergency safety features, AI-powered health assistance, and community support. The platform leverages multiple AWS services for serverless computing, medical NLP, health data standards, and real-time notifications -- all deployed with Infrastructure as Code using Terraform.

---

## What Does the Platform Do?

The platform covers six major domains:

| Domain | Key Features |
|--------|-------------|
| **Core Health Tracking** | Menstrual cycle tracking, symptom logging, mood tracking |
| **Full Lifecycle Support** | Fertility/IVF tracking, pregnancy companion, postpartum hub, menopause center |
| **Safety & Emergency** | SOS button, SafeWalk (live location sharing), anonymous incident reporting |
| **Mental Health** | AI chatbot, crisis support, therapist directory |
| **Legal & Financial** | Country-specific legal rights, financial goal tracking, salary benchmarks |
| **Community** | Peer mentorship, Q&A forum, resource map |

---

## Architecture Overview

```
                        +---------------------+
                        |   React 19 + Vite   |
                        |   (TailwindCSS)     |
                        +----------+----------+
                                   |
                              REST API
                                   |
                        +----------v----------+
                        |  Express.js + TS    |
                        |  (Node.js 20.x)    |
                        +--+-----+-----+-----+
                           |     |     |     |
              +------------+  +--+--+  |  +--+------------+
              |               |     |  |  |               |
     +--------v------+  +----v-+ +-v--v--v----+  +-------v--------+
     |  PostgreSQL   |  | AWS  | | AWS        |  | Google Gemini  |
     |  (Prisma ORM) |  | SNS  | | EventBridge|  | 1.5-flash      |
     +---------------+  +------+ | + Lambda   |  | (AI Chatbot)   |
                                  +-----+------+  +----------------+
                                        |
                              +---------+---------+
                              |                   |
                     +--------v------+   +--------v---------+
                     | Comprehend    |   | AWS HealthLake   |
                     | Medical       |   | (FHIR Export)    |
                     +---------------+   +------------------+
```

---

## Tech Stack at a Glance

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Radix UI, Framer Motion |
| Backend | Express.js 5, TypeScript, Zod validation |
| Database | PostgreSQL with Prisma ORM (47 models) |
| Auth | JWT + bcryptjs |
| Serverless | AWS Lambda (Node.js 20.x) |
| Scheduling | AWS EventBridge (cron rules) |
| Notifications | AWS SNS (SMS) |
| Medical NLP | AWS Comprehend Medical |
| Health Data | AWS HealthLake (FHIR R4) |
| AI | Google Gemini 1.5-flash |
| IaC | Terraform |
| Hosting | Render.com |

---

## Deep Dive: AWS Services in Action

### 1. AWS Lambda -- Serverless Reminders & Period Alerts

I use two Lambda functions to handle time-sensitive operations without keeping a server running 24/7.

**Reminder Processor Lambda**

When a user creates a reminder (medication, appointment, or custom), the Express backend creates a dynamic EventBridge rule that triggers this Lambda on schedule.

```typescript
// lambda/reminder-processor/index.ts (simplified)
export const handler = async (event: any) => {
  const { reminderId } = event;

  // Fetch reminder from database
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: { user: true },
  });

  if (!reminder || !reminder.isActive) return;

  // Send SMS via SNS
  await sns.publish({
    PhoneNumber: reminder.user.phone,
    Message: `Reminder: ${reminder.title} - ${reminder.description}`,
  }).promise();

  // Auto-cleanup one-time reminders
  if (reminder.frequency === 'once') {
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { isActive: false },
    });
    // Remove the EventBridge rule
    await deleteEventBridgeRule(`reminder-${reminderId}`);
  }
};
```

**Period Alert Lambda**

Runs daily at 8 AM UTC to notify users whose menstrual cycle is expected to start that day:

```typescript
// lambda/period-alert/index.ts (simplified)
export const handler = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycles = await prisma.cycle.findMany({
    where: {
      startDate: { gte: today, lt: nextDay(today) },
    },
    include: { user: true },
  });

  for (const cycle of cycles) {
    await sns.publish({
      PhoneNumber: cycle.user.phone,
      Message: "Your period is expected to start today. Take care!",
    }).promise();
  }
};
```

**Why Lambda?** These are infrequent, short-lived tasks. Running a cron job on the main server would waste resources. Lambda charges only for actual invocations -- perfect for a health app where reminders fire sporadically.

---

### 2. AWS EventBridge -- Dynamic Scheduling at Scale

EventBridge is the backbone of the reminder system. Instead of polling a database every minute, I create **one EventBridge rule per reminder** with a precise schedule expression.

```typescript
// src/services/eventbridge.service.ts (simplified)
export async function createReminderRule(reminder: Reminder) {
  const ruleName = `reminder-${reminder.id}`;

  // Create the schedule rule
  await eventBridge.putRule({
    Name: ruleName,
    ScheduleExpression: toScheduleExpression(reminder),
    State: 'ENABLED',
  }).promise();

  // Point the rule at our Lambda
  await eventBridge.putTargets({
    Rule: ruleName,
    Targets: [{
      Id: `target-${reminder.id}`,
      Arn: process.env.LAMBDA_REMINDER_PROCESSOR_ARN!,
      Input: JSON.stringify({ reminderId: reminder.id }),
    }],
  }).promise();
}
```

**Frequency mapping:**

| Reminder Type | EventBridge Expression |
|--------------|----------------------|
| Once | `at(2026-04-15T09:00:00)` |
| Daily | `rate(1 day)` |
| Weekly | `cron(0 9 ? * MON *)` |
| Monthly | `cron(0 9 1 * ? *)` |

The daily period alert uses a static rule defined in Terraform:

```hcl
# terraform/eventbridge.tf
resource "aws_cloudwatch_event_rule" "period_alert_daily" {
  name                = "period-alert-daily"
  schedule_expression = "cron(0 8 * * ? *)"
}

resource "aws_cloudwatch_event_target" "period_alert_target" {
  rule = aws_cloudwatch_event_rule.period_alert_daily.name
  arn  = aws_lambda_function.period_alert.arn
}
```

---

### 3. AWS Comprehend Medical -- Extracting Medical Insights from Free Text

When users log symptoms or moods with free-text notes, Comprehend Medical automatically extracts medical entities, ICD-10-CM codes, and medication references.

```typescript
// src/services/comprehend-medical.service.ts (simplified)
export async function analyzeSymptomText(text: string) {
  // Detect medical entities
  const entities = await comprehend.detectEntitiesV2({
    Text: text,
  }).promise();

  // Infer ICD-10 codes
  const icd10 = await comprehend.inferICD10CM({
    Text: text,
  }).promise();

  // Infer medication names (RxNorm)
  const rxNorm = await comprehend.inferRxNorm({
    Text: text,
  }).promise();

  // Infer clinical terms (SNOMED CT)
  const snomed = await comprehend.inferSNOMEDCT({
    Text: text,
  }).promise();

  return {
    entities: entities.Entities?.filter(e => e.Score! > 0.5),
    icdCodes: icd10.Entities?.filter(e => e.Score! > 0.5),
    medications: rxNorm.Entities?.filter(e => e.Score! > 0.5),
    clinicalTerms: snomed.Entities?.filter(e => e.Score! > 0.5),
  };
}
```

**Real-world example:**

A user logs: *"Severe cramping in lower abdomen, took 400mg ibuprofen, feeling nauseous"*

Comprehend Medical returns:
- **Entities:** `ANATOMY: lower abdomen`, `SYMPTOM: cramping`, `SYMPTOM: nauseous`
- **ICD-10:** `R10.30 - Lower abdominal pain`, `R11.0 - Nausea`
- **RxNorm:** `Ibuprofen 400mg`
- **SNOMED:** `Abdominal cramp`, `Nausea`

This structured data helps power the AI health assistant with medically accurate context.

---

### 4. AWS HealthLake -- FHIR-Compliant Health Data Export

For interoperability with healthcare systems, I export user health data to AWS HealthLake in FHIR R4 format.

```typescript
// src/services/healthlake.service.ts (simplified)
export async function exportUserHealthData(userId: string) {
  const [cycles, symptoms, moods] = await Promise.all([
    prisma.cycle.findMany({ where: { userId } }),
    prisma.symptom.findMany({ where: { userId } }),
    prisma.mood.findMany({ where: { userId } }),
  ]);

  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      // Cycles -> FHIR Observation
      ...cycles.map(cycle => ({
        resource: {
          resourceType: 'Observation',
          code: { text: 'Menstrual Cycle' },
          effectivePeriod: {
            start: cycle.startDate,
            end: cycle.endDate,
          },
          valueQuantity: {
            value: cycle.cycleLength,
            unit: 'days',
          },
        },
      })),
      // Symptoms -> FHIR Condition
      ...symptoms.map(symptom => ({
        resource: {
          resourceType: 'Condition',
          code: { text: symptom.type },
          severity: {
            text: `${symptom.severity}/10`,
          },
        },
      })),
      // Note: Grief journals are NEVER exported (privacy)
    ],
  };

  await healthLake.createResource({
    DatastoreId: process.env.HEALTHLAKE_DATASTORE_ID!,
    ResourceType: 'Bundle',
    ResourceBody: JSON.stringify(fhirBundle),
  }).promise();
}
```

**Why HealthLake?** FHIR is the global standard for exchanging healthcare data. By exporting to HealthLake, users can share their health records with doctors or integrate with EHR systems. Sensitive data like grief journals are explicitly excluded from exports.

---

### 5. AWS SNS -- SMS Notifications

SNS handles all SMS notifications -- reminders, SOS alerts, and period notifications. It's the simplest but most critical AWS service in the stack.

```typescript
// lambda/shared/sns.ts
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({ region: process.env.AWS_REGION });

export async function sendSMS(phone: string, message: string) {
  await sns.send(new PublishCommand({
    PhoneNumber: phone,
    Message: message,
  }));
}
```

For SOS alerts, the system sends SMS to all trusted contacts simultaneously:

```typescript
// When SOS is triggered
const contacts = await prisma.trustedContact.findMany({
  where: { userId },
});

await Promise.all(
  contacts.map(contact =>
    sendSMS(
      contact.phone,
      `EMERGENCY: ${user.name} triggered an SOS alert! ` +
      `Location: https://maps.google.com/?q=${lat},${lng}`
    )
  )
);
```

---

## Infrastructure as Code with Terraform

All AWS resources are managed with Terraform for reproducibility and version control.

```hcl
# terraform/lambda.tf
resource "aws_lambda_function" "reminder_processor" {
  function_name = "reminder-processor"
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  memory_size   = 256
  timeout       = 30

  filename         = "${path.module}/../lambda/reminder-processor/dist/bundle.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda/reminder-processor/dist/bundle.zip")

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      DATABASE_URL = var.database_url
      AWS_SNS_REGION = var.aws_region
    }
  }
}
```

```hcl
# terraform/iam.tf
resource "aws_iam_role" "lambda_exec" {
  name = "womens-safety-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = ["sns:Publish"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = ["events:DeleteRule", "events:RemoveTargets"]
        Resource = "arn:aws:events:*:*:rule/reminder-*"
      }
    ]
  })
}
```

**Deploy the infrastructure:**

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## Database Design -- 47 Models with Prisma

The PostgreSQL database uses Prisma ORM with 47 models organized across 6 domains:

```prisma
// prisma/schema.prisma (highlights)

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  phone         String?
  cycles        Cycle[]
  symptoms      Symptom[]
  moods         Mood[]
  sosAlerts     SOSAlert[]
  trustedContacts TrustedContact[]
  // ... 20+ relations
}

model Cycle {
  id          String   @id @default(uuid())
  userId      String
  startDate   DateTime
  endDate     DateTime?
  cycleLength Int?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([startDate])
}

model SOSAlert {
  id        String   @id @default(uuid())
  userId    String
  latitude  Float
  longitude Float
  status    String   @default("sent") // sent, resolved, false_alarm
  audioUrl  String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model IncidentReport {
  id        String   @id @default(uuid())
  // No userId -- fully anonymous
  type      String   // catcalling, following, assault, groping
  severity  Int      // 1-5
  latitude  Float
  longitude Float
  description String?
}
```

Key design decisions:
- **Cascade deletes** on all user relations for GDPR-style data deletion
- **No userId on IncidentReport** -- true anonymity for safety
- **JSON fields** for flexible data (IVF stages, assessment answers, medical analysis results)
- **Indexes** on userId and date fields for query performance

---

## Security -- Privacy-First Design

Security is paramount for a women's safety app:

```typescript
// src/index.ts
app.use(helmet());                          // Security headers
app.use(cors({ origin: FRONTEND_URL }));    // Strict CORS
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,                // 15-minute window
  max: 100,                                 // 100 requests per window
}));
```

- **JWT Authentication** with 7-day expiry and HTTP-only cookies
- **Password hashing** with bcryptjs (salt rounds: 12)
- **Zod validation** on every API endpoint
- **IAM least-privilege** -- Lambda roles can only access specific resources
- **Grief journals** are private and never exported to HealthLake
- **Incident reports** are fully anonymous with no user linkage

---

## The AI Health Assistant

The chatbot uses Google Gemini 1.5-flash with health context:

```typescript
// src/services/ai-chat.service.ts (simplified)
export async function chat(userId: string, message: string) {
  // Gather user's health context
  const [recentMoods, recentSymptoms, currentCycle] = await Promise.all([
    prisma.mood.findMany({ where: { userId }, take: 10, orderBy: { date: 'desc' } }),
    prisma.symptom.findMany({ where: { userId }, take: 10, orderBy: { date: 'desc' } }),
    prisma.cycle.findFirst({ where: { userId }, orderBy: { startDate: 'desc' } }),
  ]);

  const systemPrompt = `You are a compassionate women's health assistant.
    User's recent moods: ${JSON.stringify(recentMoods)}
    User's recent symptoms: ${JSON.stringify(recentSymptoms)}
    Current cycle day: ${calculateCycleDay(currentCycle)}
    Always recommend consulting a healthcare professional for medical decisions.`;

  const response = await gemini.generateContent({
    model: 'gemini-1.5-flash',
    contents: [{ role: 'user', parts: [{ text: message }] }],
    systemInstruction: systemPrompt,
  });

  // Save to chat history
  await prisma.chatHistory.create({
    data: { userId, role: 'assistant', content: response.text() },
  });

  return response.text();
}
```

---

## Deployment

The app is deployed on **Render.com** for the web server and uses **AWS** for serverless workloads:

```yaml
# render.yaml
services:
  - type: web
    name: womens-safety
    runtime: node
    plan: starter
    buildCommand: |
      npm install &&
      cd frontend && npm install && npm run build && cd .. &&
      npx prisma generate &&
      npx tsc
    startCommand: node dist/index.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: womens-safety-db
          property: connectionString
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      # ... other env vars

databases:
  - name: womens-safety-db
    plan: starter
    databaseName: womens_safety
```

---

## Lessons Learned

### 1. EventBridge Rules Have Limits
AWS allows up to **300 rules per event bus** by default. For a production app with thousands of reminders, you need to request a quota increase or batch reminders into fewer rules.

### 2. Comprehend Medical Pricing
Comprehend Medical charges per character analyzed. I added a **confidence threshold filter (>0.5)** to reduce noise and only store meaningful results.

### 3. Privacy is Architecture
Anonymity in incident reporting isn't just "don't show the name" -- it's "don't store the userId at all." Similarly, grief journals are flagged at the schema level to be excluded from any export.

### 4. FHIR Mapping Takes Thought
Converting app-specific data models to FHIR resources requires careful mapping. Not everything maps 1:1. Menstrual cycles became Observations, symptoms became Conditions, and some data (like moods) required custom coding systems.

### 5. Terraform for Reproducibility
Managing Lambda functions, EventBridge rules, and IAM policies manually is error-prone. Terraform ensures that every environment is identical and changes are version-controlled.

---

## What's Next?

- **Amazon Bedrock** integration for a more powerful, private AI assistant
- **AWS Location Service** for real-time SafeWalk tracking
- **Amazon Pinpoint** for multi-channel notifications (push, email, SMS)
- **AWS WAF** for API protection at the edge
- **Multi-language support** for global reach

---

## AWS Services Used -- Summary

| Service | Purpose | Why This Service? |
|---------|---------|-------------------|
| **Lambda** | Serverless reminder processing, daily alerts | Pay-per-use, no idle costs |
| **EventBridge** | Dynamic scheduling of reminders | Native cron, rule-per-reminder pattern |
| **SNS** | SMS notifications for SOS and reminders | Simple, reliable, global reach |
| **Comprehend Medical** | Extract medical entities from free text | Purpose-built for healthcare NLP |
| **HealthLake** | FHIR-compliant health data export | Interoperability with healthcare systems |
| **IAM** | Least-privilege access control | Security best practice |
| **CloudWatch** | Lambda logging and monitoring | Native integration |

---

## Conclusion

Building a women's safety and health platform taught me that **AWS services compose beautifully** for healthcare applications. Lambda + EventBridge handles scheduling without servers. Comprehend Medical turns free-text notes into structured medical data. HealthLake ensures data portability with FHIR. And SNS delivers critical safety alerts in real-time.

The key takeaway: **serverless architecture is ideal for health apps** where workloads are event-driven and unpredictable. You pay only when a reminder fires, an SOS triggers, or a symptom is analyzed -- not for idle compute.

If you're building in the healthcare or safety space, I encourage you to explore these AWS services. The combination of managed AI/ML services, serverless compute, and healthcare-specific tools makes AWS a powerful platform for social impact applications.

---

**Resources:**
- [AWS Comprehend Medical Documentation](https://docs.aws.amazon.com/comprehend-medical/)
- [AWS HealthLake Documentation](https://docs.aws.amazon.com/healthlake/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Prisma ORM Documentation](https://www.prisma.io/docs)

---

*Have questions or feedback? Connect with me on the [AWS Community Builders](https://aws.amazon.com/developer/community/community-builders/) program!*
