resource "aws_cloudwatch_log_group" "container" {
  name = "${var.container_family}-${var.chain_id}"
}

resource "aws_ecs_task_definition" "service" {
  family                   = "${var.container_family}-${var.chain_id}"
  memory                   = var.memory
  cpu                      = var.cpu
  requires_compatibilities = ["EC2"]
  network_mode             = "host"
  execution_role_arn       = var.execution_role_arn
  container_definitions    = <<DEFINITION
[
 {
   "name": "${var.container_family}-${var.chain_id}",
   "image": "${var.docker_image}",
   "environment": [
      {"name": "TARGET_CHAIN_ID", "value": "${var.chain_id}"},
      {"name": "ETHEREUM_ADMIN_ACCOUNT", "value": "${var.ethereum_admin_account}"},
      {"name": "ETHEREUM_ADMIN_PRIVATE_KEY", "value": "${var.ethereum_admin_private_key}"},
      {"name": "WEB3_HTTP_PROVIDER_URL", "value": "${var.web3_provider_url}"},
      {"name": "SUPPORTED_INPUT_CURRENCIES", "value": "${var.supported_input_currencies}"},
      {"name": "SUPPORTED_OUTPUT_CURRENCIES", "value": "${var.supported_output_currencies}"}
   ],
   "networkMode": "host",
   "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "${aws_cloudwatch_log_group.container.name}",
                    "awslogs-region": "eu-central-1",
                    "awslogs-stream-prefix": "logs"
                }
            }
 }
]
DEFINITION
}


resource "aws_ecs_service" "default" {
  name                    = "${var.container_family}-${var.chain_id}"
  desired_count           = var.instance_count
  cluster                 = var.cluster_id
  enable_ecs_managed_tags = true
  tags                    = {
    chain = var.chain_id
  }
  task_definition = aws_ecs_task_definition.service.arn

}

