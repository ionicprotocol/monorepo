locals {
  # Create a result map of all built-in event rules and given custom rules.
  event_rules = merge(
    var.enable_ecs_task_state_event_rule ? {
      ECSTaskStateChange = {
        detail-type = ["ECS Task State Change"]
        detail      = var.ecs_task_state_event_rule_detail
      }
    } : {},
    var.enable_ecs_deployment_state_event_rule ? {
      ECSDeploymentStateChange = {
        detail-type = ["ECS Deployment State Change"]
        detail      = var.ecs_deployment_state_event_rule_detail
      }
    } : {},
    var.enable_ecs_service_action_event_rule ? {
      ECSServiceAction = {
        detail-type = ["ECS Service Action"]
        detail      = var.ecs_service_action_event_rule_detail
      }
    } : {},
    var.custom_event_rules
  )
}

resource "aws_cloudwatch_event_rule" "this" {
  for_each = local.event_rules

  name = "${var.name}-${each.key}"
  event_pattern = jsonencode({
    source      = [try(each.value.source, "aws.ecs")]
    detail-type = each.value.detail-type
    detail      = each.value.detail
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "this" {
  for_each = local.event_rules

  target_id = "${var.name}-${each.key}"
  arn       = module.discord_notifications.lambda_function_arn
  rule      = aws_cloudwatch_event_rule.this[each.key].name
}

module "discord_notifications" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "3.2.0"

  function_name = var.name
  role_name     = var.role_name
  description   = "Receive events from EventBridge and send them to Discord"
  handler       = "discord_notifications.lambda_handler"
  source_path   = "${path.module}/functions/discord_notifications.py"
  runtime       = "python3.9"
  timeout       = 30
  publish       = true

  allowed_triggers = {
    for rule, params in local.event_rules : rule => {
      principal    = "events.amazonaws.com"
      source_arn   = aws_cloudwatch_event_rule.this[rule].arn
      statement_id = "AllowExecutionFrom${rule}"
    }
  }

  environment_variables = {
    DISCORD_WEBHOOK_URL = var.discord_webhook_url
    LOG_EVENTS          = true
    LOG_LEVEL           = "DEBUG"
  }

  cloudwatch_logs_retention_in_days = 14

  tags = var.tags
}
