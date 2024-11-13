variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "task_definition_family" {
  description = "Family name of the task definition"
  type        = string
}

variable "cpu" {
  description = "CPU units for the task definition"
  type        = string
  default     = "4096"
}

variable "memory" {
  description = "Memory for the task definition"
  type        = string
  default     = "8192"
}

variable "liquidator_container_name" {
  description = "Name of the container"
  type        = string
}

variable "ecr_repository_url" {
  description = "URL of the ECR repository"
  type        = string
}

variable "bots_image_tag" {
  description = "Tag for the bot image"
  type        = string
}

variable "uptime_liquidator_api" {
  description = "Uptime liquidator API"
  type        = string
}
variable "web3_http_provider_urls" {
  type        = string
  description = "List of Web3 HTTP Provider URLs"
}

variable "target_chain_id" {
  description = "Target chain ID"
  type        = string
}

variable "ethereum_admin_account" {
  description = "Ethereum admin account"
  type        = string
}

variable "ethereum_admin_private_key" {
  description = "Private key for Ethereum admin"
  type        = string
}

variable "ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
}

variable "desired_count" {
  description = "Desired number of ECS service instances"
  type        = number
}

variable "subnet_ids" {
  description = "Subnets for the ECS service"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups for the ECS service"
  type        = list(string)
}

variable "region" {
  description = "AWS region"
  type        = string
}
variable "liquidation_discord_webhook_url" {
  description = "The Discord webhook URL for liquidation notifications."
  type        = string
}
variable "discord_failure_webhook_url" {
  type = string
}
variable "discord_success_webhook_url" {
  type = string
}

variable "lifi_api_key" {
  type = string
}
