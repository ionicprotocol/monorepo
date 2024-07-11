variable "execution_role_arn" {}

variable "cluster_id" {}


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

variable "provider_urls" {
  description = "List of provider URLs"
  type        = list(string)
}

variable "runtime_env_vars" {
  description = "Runtime environment variables"
  type        = list(object({
    name  = string
    value = string
  }))
}



variable "region" {

}
