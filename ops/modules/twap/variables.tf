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


variable "timeout" {
  default = 60
}


variable "ecs_cluster_sg" {
}

variable "allow_all_sg" {
}

variable "chain_id" {
  type = string
}

variable "ethereum_admin_account" {
  type = string
}
variable "ethereum_admin_private_key" {
  type = string
}
variable "web3_provider_url" {
  type = string
}
variable "supported_pairs" {
  type = string
}
