resource "aws_sns_topic" "task_failure" {
  name = "${var.container_family}-${var.environment}-${var.chain_id}_task_failure"
}

resource "aws_cloudwatch_event_target" "sns_target" {
  rule  = aws_cloudwatch_event_rule.task_failure.name
  arn   = aws_sns_topic.task_failure.arn
  input = jsonencode({ "message" : "Task ${var.container_family} failed! Please check logs https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups/log-group/${var.container_family}-${var.environment}-${var.chain_id}" })
}

data "aws_iam_policy_document" "task_failure" {

  statement {
    actions   = ["SNS:Publish"]
    effect    = "Allow"
    resources = [aws_sns_topic.task_failure.arn]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
  }
}

resource "aws_sns_topic_policy" "task_failure" {
  arn    = aws_sns_topic.task_failure.arn
  policy = data.aws_iam_policy_document.task_failure.json
}
