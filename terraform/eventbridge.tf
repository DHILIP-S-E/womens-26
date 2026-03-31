# ============================================================
# EventBridge: Period Alert Daily Rule (fixed schedule)
# ============================================================

resource "aws_cloudwatch_event_rule" "period_alert_daily" {
  name                = "period-alert-daily"
  description         = "Daily 8 AM UTC period alert check"
  schedule_expression = "cron(0 8 * * ? *)"
  state               = "ENABLED"
}

resource "aws_cloudwatch_event_target" "period_alert_target" {
  rule      = aws_cloudwatch_event_rule.period_alert_daily.name
  target_id = "period-alert-target"
  arn       = aws_lambda_function.period_alert.arn
}

resource "aws_lambda_permission" "eventbridge_period_alert" {
  statement_id  = "allow-eb-period-alert-daily"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.period_alert.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.period_alert_daily.arn
}

# ============================================================
# Lambda Permission: Allow EventBridge to invoke reminder-processor
# (Individual reminder rules are created dynamically by the Express app,
#  but we grant blanket permission for any rule matching reminder-*)
# ============================================================

resource "aws_lambda_permission" "eventbridge_reminder_processor" {
  statement_id  = "allow-eb-reminder-rules"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.reminder_processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = "arn:aws:events:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:rule/reminder-*"
}
