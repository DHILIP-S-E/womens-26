# ============================================================
# Lambda: Reminder Processor
# ============================================================

data "archive_file" "reminder_processor" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/dist/packages/reminder-processor"
  output_path = "${path.module}/.build/reminder-processor.zip"
}

resource "aws_lambda_function" "reminder_processor" {
  function_name = "${var.project_name}-reminder-processor-${var.environment}"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.reminder_processor.output_path
  source_code_hash = data.archive_file.reminder_processor.output_base64sha256

  environment {
    variables = {
      DATABASE_URL           = var.database_url
      AWS_SNS_PHONE_NUMBER   = var.sns_phone_number
      EVENTBRIDGE_BUS_NAME   = "default"
    }
  }
}

resource "aws_cloudwatch_log_group" "reminder_processor" {
  name              = "/aws/lambda/${aws_lambda_function.reminder_processor.function_name}"
  retention_in_days = 14
}

# ============================================================
# Lambda: Period Alert
# ============================================================

data "archive_file" "period_alert" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/dist/packages/period-alert"
  output_path = "${path.module}/.build/period-alert.zip"
}

resource "aws_lambda_function" "period_alert" {
  function_name = "${var.project_name}-period-alert-${var.environment}"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 60
  memory_size   = 256

  filename         = data.archive_file.period_alert.output_path
  source_code_hash = data.archive_file.period_alert.output_base64sha256

  environment {
    variables = {
      DATABASE_URL         = var.database_url
      AWS_SNS_PHONE_NUMBER = var.sns_phone_number
    }
  }
}

resource "aws_cloudwatch_log_group" "period_alert" {
  name              = "/aws/lambda/${aws_lambda_function.period_alert.function_name}"
  retention_in_days = 14
}
