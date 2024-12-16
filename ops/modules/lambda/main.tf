data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  account_id     = data.aws_caller_identity.current.account_id
  repository_url = "${local.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.ecr_repository_name}"
}

resource "aws_iam_role" "lambda" {
  name = "${var.container_family}-${var.environment}-${var.target_chain_id}-lambda-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "lambda.amazonaws.com"
        },
        "Effect" : "Allow"
      }
    ]
  })

  inline_policy {
    name = "${var.container_family}-${var.environment}-${var.target_chain_id}-lambda-policies"
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Effect" : "Allow",
          "Action" : [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          "Resource" : ["*"]
        }
      ]
    })
  }
}
resource "aws_lambda_function" "executable" {
  function_name = "${var.container_family}-${var.environment}-${var.target_chain_id}"
  image_uri     = "${local.repository_url}:${var.docker_image_tag}"
  package_type  = "Image"
  role          = aws_iam_role.lambda.arn
  architectures = ["x86_64"]
  timeout       = var.timeout
  memory_size   = var.memory_size
  environment {
    variables = merge(var.container_env_vars, { TARGET_target_chain_id = var.target_chain_id })
  }
}

resource "aws_lambda_permission" "allow_events_bridge_to_run_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.executable.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.event_rule.arn
}

resource "aws_cloudwatch_event_rule" "event_rule" {
  name                = "${var.container_family}-${var.environment}-${var.target_chain_id}-event-rule"
  description         = "Fires every X minutes"
  schedule_expression = var.schedule_expression
}

# Trigger our lambda based on the schedule
resource "aws_cloudwatch_event_target" "trigger_lambda_on_schedule" {
  rule      = aws_cloudwatch_event_rule.event_rule.name
  target_id = "lambda"
  arn       = aws_lambda_function.executable.arn
}
