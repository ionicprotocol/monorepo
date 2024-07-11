# Provider configuration for AWS
provider "aws" {
  region = var.aws_region
}

# Define local variables for convenience
locals {
  base_mainnet_rpc_0    = "https://mainnet.base.org/"
  base_mainnet_chain_id = "8453"
}

# AWS ECR repository for storing Docker images
resource "aws_ecr_repository" "my_repo" {
  name = var.ecr_repository_name
}

# AWS ECS cluster definition
resource "aws_ecs_cluster" "my_cluster" {
  name = var.ecs_cluster_name
}

# AWS CloudWatch log groups for ECS task containers
resource "aws_cloudwatch_log_group" "ecs_logs" {
  count = length(var.container_names)

  name = "/ecs/${aws_ecs_cluster.my_cluster.name}/${var.container_names[count.index]}"
}

# AWS ECS task definition
resource "aws_ecs_task_definition" "my_task" {
  family                   = var.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory

  container_definitions = jsonencode([
    {
      name            = var.container_name
      image           = "${aws_ecr_repository.my_repo.repository_url}:latest"
      essential       = true
      log_configuration {
        log_driver = "awslogs"
        options = {
          "awslogs-group"  = aws_cloudwatch_log_group.ecs_logs[count.index].name
          "awslogs-region" = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
      environment = [
        {
          name  = "WEB3_HTTP_PROVIDER_URL"
          value = local.base_mainnet_rpc_0
        },
        {
          name  = "CHAIN_ID"
          value = local.base_mainnet_chain_id
        },
        # Add other environment variables as needed
      ]
    }
  ])
}

# AWS ECS service definition
resource "aws_ecs_service" "my_service" {
  name            = "${var.ecs_cluster_name}-service"
  cluster         = aws_ecs_cluster.my_cluster.id
  task_definition = aws_ecs_task_definition.my_task.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnets
    security_groups = var.security_groups
  }
}

# Output variables for ECS cluster and service names
output "ecs_cluster_name" {
  value = aws_ecs_cluster.my_cluster.name
}

output "ecs_service_name" {
  value = aws_ecs_service.my_service.name
}
