variable "region" {
  default = "eu-central-1"
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

variable "moralis_api_key" {
  type = string
}

variable "twap_bot_image" {
  type    = string
  default = "ghcr.io/midas-protocol/fuse-twap-bot:sha-94058271f1bedd35432866ef1e01030ffd519577"
}

variable "liquidator_bot_image" {
  type    = string
  default = "ghcr.io/midas-protocol/fuse-liquidator-bot:sha-f8b43ac253f3475e44118018a9a5f581a90e119e"
}
