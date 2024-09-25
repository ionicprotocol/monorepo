locals {
  # Multiple Mode Mainnet RPC URLs (comma-separated environment variable)
  mode_mainnet_rpcs    = var.mode_mainnet_rpcs 
  mode_mainnet_chain_id = "34443"
}

/* module "mode_mainnet_liquidation_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.liquidator_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator-rpc-0"
  environment         = "mainnet"
  chain_id            = local.mode_mainnet_chain_id
  container_env_vars = merge(
    local.liquidation_variables,
    { WEB3_HTTP_PROVIDER_URLS = local.mode_mainnet_rpcs }  # Directly use the string
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 512
} */

module "mode_mainnet_liquidator_ecs" {
  source = "../modules/bot"

  cluster_name               = var.liquidator_cluster_name
  task_definition_family     = var.task_definition_family
  ecr_repository_url         = "${local.liquidator_ecr_repository_name}:${var.bots_image_tag}"
  bots_image_tag             = var.bots_image_tag
  web3_http_provider_urls    = local.mode_mainnet_rpcs
  target_chain_id            = local.mode_mainnet_chain_id
  ethereum_admin_account     = var.ethereum_admin_account
  ethereum_admin_private_key = var.ethereum_admin_private_key
  ecs_service_name           = var.liquidator_service_name
  desired_count              = var.desired_count
  liquidation_discord_webhook_url = var.liquidation_discord_webhook_url
  subnet_ids                 = ["subnet-0cd439d262800846e"]
  security_group_ids         = ["sg-0a3996557af867ad0"]
  region                     = var.region
  liquidator_container_name  = var.liquidator_container_name
}
module "mode_mainnet_pyth_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.pyth_updater_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "pyth-updater-rpc-0"
  environment         = "mainnet"
  chain_id            = local.mode_mainnet_chain_id
  container_env_vars = merge(
    local.pyth_updater_lambda_variables,
    { WEB3_HTTP_PROVIDER_URLS = local.mode_mainnet_rpcs }  # Directly use the string
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 512
}
