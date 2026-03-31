# ============================================================
# Lambda Execution Role (shared by both Lambda functions)
# ============================================================

resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-execution-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Logs — so Lambda can write logs
resource "aws_iam_role_policy" "lambda_logging" {
  name = "lambda-logging"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"
      }
    ]
  })
}

# SNS Publish — so Lambda can send SMS
resource "aws_iam_role_policy" "lambda_sns" {
  name = "lambda-sns"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = "*"
      }
    ]
  })
}

# EventBridge — so reminder-processor can self-cleanup one-time rules
resource "aws_iam_role_policy" "lambda_eventbridge_cleanup" {
  name = "lambda-eventbridge-cleanup"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "events:RemoveTargets",
          "events:DeleteRule"
        ]
        Resource = "arn:aws:events:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:rule/reminder-*"
      }
    ]
  })
}

# VPC access (if Lambda needs to reach RDS in a VPC — uncomment if needed)
# resource "aws_iam_role_policy_attachment" "lambda_vpc" {
#   role       = aws_iam_role.lambda_execution.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
# }

# ============================================================
# Express App IAM User (for backend server)
# ============================================================

resource "aws_iam_user" "express_app" {
  name = "${var.project_name}-express-app-${var.environment}"
}

resource "aws_iam_access_key" "express_app" {
  user = aws_iam_user.express_app.name
}

# SNS — send SMS from Express app
resource "aws_iam_user_policy" "express_sns" {
  name = "express-sns"
  user = aws_iam_user.express_app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = "*"
      }
    ]
  })
}

# Comprehend Medical — analyze symptom/mood text
resource "aws_iam_user_policy" "express_comprehend_medical" {
  name = "express-comprehend-medical"
  user = aws_iam_user.express_app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "comprehendmedical:DetectEntitiesV2",
          "comprehendmedical:InferICD10CM",
          "comprehendmedical:InferRxNorm",
          "comprehendmedical:InferSNOMEDCT"
        ]
        Resource = "*"
      }
    ]
  })
}

# EventBridge — manage reminder rules from Express app
resource "aws_iam_user_policy" "express_eventbridge" {
  name = "express-eventbridge"
  user = aws_iam_user.express_app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "events:PutRule",
          "events:PutTargets",
          "events:RemoveTargets",
          "events:DeleteRule",
          "events:DescribeRule"
        ]
        Resource = [
          "arn:aws:events:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:rule/reminder-*",
          "arn:aws:events:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:rule/period-alert-daily"
        ]
      }
    ]
  })
}

# Lambda permissions — so Express app can grant EventBridge invoke access
resource "aws_iam_user_policy" "express_lambda_permissions" {
  name = "express-lambda-permissions"
  user = aws_iam_user.express_app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:AddPermission",
          "lambda:RemovePermission"
        ]
        Resource = [
          aws_lambda_function.reminder_processor.arn,
          aws_lambda_function.period_alert.arn
        ]
      }
    ]
  })
}

# HealthLake — existing integration
resource "aws_iam_user_policy" "express_healthlake" {
  name = "express-healthlake"
  user = aws_iam_user.express_app.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "healthlake:CreateResource",
          "healthlake:ReadResource",
          "healthlake:UpdateResource"
        ]
        Resource = "*"
      }
    ]
  })
}
