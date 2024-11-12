provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

resource "aws_ecs_cluster" "liquidator_cluster" {
  provider = aws.us-east-1
  name     = var.cluster_name
}

resource "aws_ecs_task_definition" "liquidator_bot_ecs_task" {
  provider                = aws.us-east-1
  family                  = var.task_definition_family
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]

  cpu    = "2048"
  memory = "4096"

  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = var.liquidator_container_name
      image     = "058264122535.dkr.ecr.us-east-1.amazonaws.com/liquidator-ecs:${var.bots_image_tag}"
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.liquidator_container_name}"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
           environment = [
        {
          name  = "WEB3_HTTP_PROVIDER_URLS"
          value = "${var.web3_http_provider_urls}"
        },
        {
          name  = "TARGET_CHAIN_ID"
          value = "34443"
        },
        {
          name  = "ETHEREUM_ADMIN_ACCOUNT"
          value = "${var.ethereum_admin_account}"
        },
        {
          name  = "ETHEREUM_ADMIN_PRIVATE_KEY"
          value = "${var.ethereum_admin_private_key}"
        },
        {
          name  = "DISCORD_WEBHOOK_URL"
          value = "${var.liquidation_discord_webhook_url}"
        },
        {
          name  = "DISCORD_FAILURE_WEBHOOK_URL"
          value = "${var.discord_failure_webhook_url}"
        },
        {
          name  = "DISCORD_SUCCESS_WEBHOOK_URL"
          value = "${var.discord_success_webhook_url}"
        },
        {
          name  = "LIFIAPIKEY"
          value = "${var.lifi_api_key}"
        }
      ] 
    }
  ])
}

resource "aws_iam_role" "ecs_task_execution_role" {
  provider = aws.us-east-1
  name     = "ecs-task-execution-role-test"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action    = "sts:AssumeRole"
      }
    ]
  })
  
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    "arn:aws:iam::aws:policy/AWSOpsWorksCloudWatchLogs"
  ]
}

resource "aws_ecs_service" "liqui_ecs" {
  provider         = aws.us-east-1
  name             = var.ecs_service_name
  cluster          = aws_ecs_cluster.liquidator_cluster.id
  task_definition  = aws_ecs_task_definition.liquidator_bot_ecs_task.arn
  desired_count    = var.desired_count
  launch_type      = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.security_group_ids
    assign_public_ip = true
  }
  
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}