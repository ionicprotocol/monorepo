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
