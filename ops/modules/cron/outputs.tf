output "logs_group" {
  value = aws_cloudwatch_log_group.container.name
}

output "service_name" {
  value = aws_ecs_service.service.name
}

