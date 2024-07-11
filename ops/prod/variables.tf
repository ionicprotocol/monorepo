variable "region" {
  default = "us-east-1"
}

variable "cidr_block" {
  default = "172.17.0.0/16"
}

variable "az_count" {
  default = "2"
}

variable "ethereum_admin_account" {
  type = string
}

variable "ethereum_admin_private_key" {
  type = string
}

variable "infura_api_key" {
  type = string
}

variable "bots_image_tag" {
  type    = string
  default = "latest"
}

variable "oracles_discord_webhook_url" {
  type = string
}

variable "pyth_updater_discord_webhook_url" {
  type = string
}

variable "liquidation_discord_webhook_url" {
  type = string
}

variable "liquidation_sendgrid_api_key" {
  type = string
}

variable "liquidation_sendgrid_email_to" {
  type = string
}

variable "supabase_key" {
  type = string
}

variable "uptime_liquidator_api" {
  type = string
}

variable "uptime_pyth_updater_api" {
  type = string
}





variable "ecr_repository_name" {
  description = "The name of the ECR repository"
  type        = string
}

variable "ecs_cluster_name" {
  description = "The name of the ECS cluster"
  type        = string
}

variable "task_family" {
  description = "The family name of the ECS task definition"
  type        = string
}

variable "container_name" {
  description = "The name of the container"
  type        = string
}

variable "container_port" {
  description = "The port the container will listen on"
  type        = number
}

variable "host_port" {
  description = "The port the host will listen on"
  type        = number
}

variable "cpu" {
  description = "The amount of CPU units to allocate to the task"
  type        = string
}

variable "memory" {
  description = "The amount of memory (in MiB) to allocate to the task"
  type        = string
}

variable "subnets" {
  description = "A list of subnet IDs for the ECS service"
  type        = list(string)
}

variable "security_groups" {
  description = "A list of security group IDs for the ECS service"
  type        = list(string)
}

variable "desired_count" {
  description = "The desired number of ECS service instances"
  type        = number
}