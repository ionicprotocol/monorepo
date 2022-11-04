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

variable "chainstack_bsc_rpc_url" {
  type = string
}

variable "pokt_api_key" {
  type = string
}

variable "chainstack_polygon_rpc_url" {
  type = string
}

variable "twap_bot_image" {
  type    = string
  default = "ghcr.io/midas-protocol/fuse-twap-bot:sha-c6f1b30461d38d6eda523824c63844db5f730df3"
}

variable "liquidator_bot_image" {
  type    = string
  default = "ghcr.io/midas-protocol/fuse-liquidator-bot:sha-c6f1b30461d38d6eda523824c63844db5f730df3"
}

variable "oracles_monitor_image" {
  type    = string
  default = "ghcr.io/midas-protocol/oracles-monitor:sha-c6f1b30461d38d6eda523824c63844db5f730df3"
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
