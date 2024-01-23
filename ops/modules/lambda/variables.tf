variable "docker_image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}
variable "ecr_repository_name" {
  description = "ECR repository name"
  type        = string
}

variable "environment" {
  description = "Environment"
  type        = string
}

variable "container_family" {
  description = "Container family"
  type        = string
}

variable "chain_id" {
  description = "chain id to use"
}


variable "container_env_vars" {
  description = "env vars for running container"
}
variable "schedule_expression" {
  description = "how to schedule the cron job"
  default     = "cron(* * * * ? *)"
}

variable "memory_size" {
  description = "memory size for lambda"
  default     = 128
}

variable "timeout" {
  description = "timeout for lambda"
  default     = 100
}
