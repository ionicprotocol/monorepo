locals {
  # Multiple Mode Mainnet RPC URLs (comma-separated environment variable)
  mode_mainnet_rpcs    = var.mode_mainnet_rpcs  # Assuming var.mode_mainnet_rpcs is set as a comma-separated string in your environment variables.
  mode_mainnet_chain_id = "34443"
}

module "mode_mainnet_liquidation_rpc_0" {
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
}

module "mode_mainnet_liquidator_ecs" {
  source = "../modules/bot"

  cluster_name               = var.cluster_name
  task_definition_family     = var.task_definition_family
  container_name             = var.container_name
  ecr_repository_url         = "${local.liquidator_ecr_repository_name}:${var.bots_image_tag}"
  bots_image_tag             = var.bots_image_tag
  web3_http_provider_url     = var.mode_mainnet_rpcs
  target_chain_id            = local.mode_mainnet_chain_id
  ethereum_admin_account     = var.ethereum_admin_account
  ethereum_admin_private_key = var.ethereum_admin_private_key
  per_discord_webhook_url    = var.per_discord_webhook_url
  ecs_service_name           = var.ecs_service_name
  desired_count              = var.desired_count
  subnet_ids                 = var.subnet_ids
  security_group_ids         = var.security_group_ids
  region                     = var.region
}
module "mode_mainnet_pyth_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.pyth_updater_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "pyth-updater-rpc-0"
  environment         = "mainnet"
  chain_id            = local.mode_mainnet_chain_id
  container_env_vars = merge(
    local.liquidation_variables,
    { WEB3_HTTP_PROVIDER_URLS = local.mode_mainnet_rpcs }  # Directly use the string
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 512
}
