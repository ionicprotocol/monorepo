resource "aws_cloudwatch_log_group" "container" {
  name = "${var.container_family}-${var.environment}-${var.chain_id}"
}

locals {
  container_definitions = [for index, rpc_url in var.provider_urls : {
    name        = "${var.container_family}-${var.environment}-${var.chain_id}-${index}"
    image       = var.docker_image
    environment = concat(var.runtime_env_vars, [{ name = "WEB3_HTTP_PROVIDER_URL", value = rpc_url }])
    networkMode = "awsvpc"
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        awslogs-group         = aws_cloudwatch_log_group.container.name,
        awslogs-region        = var.region,
        awslogs-stream-prefix = "logs"
      }
    }
  }]
}

resource "aws_ecs_task_definition" "service" {
  family                   = "${var.container_family}-${var.environment}-${var.chain_id}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  container_definitions    = jsonencode(local.container_definitions)
}


resource "aws_ecs_service" "service" {
  name          = "${var.container_family}-${var.environment}-${var.chain_id}"
  cluster       = var.cluster_id
  desired_count = var.instance_count

  launch_type = "FARGATE"
  # Track the latest ACTIVE revision
  task_definition = "${aws_ecs_task_definition.service.family}:${max("${aws_ecs_task_definition.service.revision}", "${aws_ecs_task_definition.service.revision}")}"

  network_configuration {
    assign_public_ip = true
    security_groups  = flatten([var.service_security_groups])
    subnets          = var.subnets
  }
}
