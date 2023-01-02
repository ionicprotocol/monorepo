variable "execution_role_arn" {}

variable "cluster_id" {}
variable "ecs_cluster_arn" {}


variable "docker_image" {}

variable "container_family" {}

variable "instance_count" {
  default = 1
}

variable "cpu" {
  default = 256
}

variable "memory" {
  default = 512
}


variable "service_security_groups" {
}

variable "subnets" {
}


variable "chain_id" {
  type = string
}

variable "environment" {
  type = string
}

variable "runtime_env_vars" {
  type = list(object({ name = string, value = string }))
}

variable "provider_urls" {
  type = list(string)
}


variable "region" {}

variable "schedule_expression" {
  description = "how to schedule the cron job"
  default     = "cron(* * * * ? *)"
}
