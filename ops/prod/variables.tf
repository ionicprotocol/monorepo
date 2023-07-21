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

variable "chainstack_bsc_rpc_url" {
  type = string
}

variable "pokt_api_key" {
  type = string
}

variable "chainstack_polygon_rpc_url" {
  type = string
}

variable "bots_image_tag" {
  type    = string
  default = "latest"
}

variable "ecs_notifier_discord_webhook_url" {
  type = string
}

variable "oracles_discord_webhook_url" {
  type = string
}


variable "liquidation_discord_webhook_url" {
  type = string
}


variable "supabase_key" {
  type = string
}
