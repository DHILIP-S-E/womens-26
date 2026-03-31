-- AlterTable
ALTER TABLE "Mood" ADD COLUMN     "medicalInsights" JSONB;

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "eventBridgeRuleArn" TEXT;

-- AlterTable
ALTER TABLE "Symptom" ADD COLUMN     "medicalInsights" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" VARCHAR(20);
