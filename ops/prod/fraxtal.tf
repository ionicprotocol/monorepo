locals {
  # Base Network RPC URL (this will be passed in via GitHub Secrets)
  fraxtal_mainnet_rpcs = var.fraxtal_mainnet_rpcs # List of RPC URLs from environment variable
  fraxtal_mainnet_chain_id = "252"
}


module "fraxtal_mainnet_liquidator_ecs" {
  source = "../modules/bot"

  cluster_name               = var.liquidator_cluster_name
  task_definition_family     = var.task_definition_family_fraxtal
  ecr_repository_url         = "${local.liquidator_ecr_repository_name}:${var.bots_image_tag}"
  bots_image_tag             = var.bots_image_tag
  web3_http_provider_urls    = local.fraxtal_mainnet_rpcs
  target_chain_id            = local.fraxtal_mainnet_chain_id
  ethereum_admin_account     = var.ethereum_admin_account
  uptime_liquidator_api      = var.uptime_liquidator_api
  ethereum_admin_private_key = var.ethereum_admin_private_key
  ecs_service_name           = "${var.liquidator_service_name}-fraxtal"
  desired_count              = var.desired_count
  liquidation_discord_webhook_url = var.liquidation_discord_webhook_url
  discord_success_webhook_url = var.discord_success_webhook_url
  discord_failure_webhook_url = var.discord_failure_webhook_url
  lifi_api_key              = var.lifi_api_key
  subnet_ids                = ["subnet-0cd439d262800846e"]
  security_group_ids        = ["sg-0a3996557af867ad0"]
  region                    = var.region
  liquidator_container_name = "${var.liquidator_container_name}-fraxtal"
}
