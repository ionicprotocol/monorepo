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
variable "per_discord_webhook_url" {
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


variable "container_name" {
  description = "The name of the container"
  type        = string
}
variable "liquidator_container_name" {
  description = "The name of the container"
  type        = string
}



variable "desired_count" {
  description = "The desired number of ECS service instances"
  type        = number
}


variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}
variable "liquidator_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "task_definition_family" {
  description = "Family name of the task definition"
  type        = string
}


variable "docker_image" {
  description = "Docker image URL to deploy"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs where ECS tasks can be launched"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for ECS tasks"
  type        = list(string)
}

variable "autoscaling_group_name" {
  description = "Name of the Autoscaling Group to reference for ECS capacity provider"
  type        = string
}
variable "ecs_service_name"{

}
variable "liquidator_service_name"{

}
variable "base_mainnet_rpcs" {
  description = "Comma-separated list of base mainnet RPC URLs"
  type        = string
}
variable "mode_mainnet_rpcs" {
  description = "Comma-separated list of base mainnet RPC URLs"
  type        = string
}