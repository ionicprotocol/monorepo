locals {
  optimism_mainnet_rpc_0    = var.optimism_mainnet_rpcs
  optimism_mainnet_chain_id = "10"
}


/*module "optimism_mainnet_liquidation_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.liquidator_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator-optimism-rpc-0"
  environment         = "mainnet"
  chain_id            = local.optimism_mainnet_chain_id
  container_env_vars = merge(
    local.liquidation_variables,
    { WEB3_HTTP_PROVIDER_URLS = local.optimism_mainnet_rpc_0 }
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 512
}*/
module "optimism_mainnet_liquidator_ecs" {
  source = "../modules/bot"

  cluster_name               = var.liquidator_cluster_name
  cpu    = "256"  # Custom CPU value
  memory = "512"  # Custom memory value
  task_definition_family     = var.task_definition_family_optimism
  ecr_repository_url         = "${local.liquidator_ecr_repository_name}:${var.bots_image_tag}"
  bots_image_tag             = var.bots_image_tag
  web3_http_provider_urls    = local.optimism_mainnet_rpc_0
  target_chain_id            = local.optimism_mainnet_chain_id
  ethereum_admin_account     = var.ethereum_admin_account
  uptime_liquidator_api      = var.uptime_liquidator_api
  ethereum_admin_private_key = var.ethereum_admin_private_key
  ecs_service_name           = "${var.liquidator_service_name}-optimism"
  desired_count              = var.desired_count
  liquidation_discord_webhook_url = var.liquidation_discord_webhook_url
  discord_success_webhook_url = var.discord_success_webhook_url
  discord_failure_webhook_url = var.discord_failure_webhook_url
  lifi_api_key              = var.lifi_api_key
  subnet_ids                = ["subnet-0cd439d262800846e"]
  security_group_ids        = ["sg-0a3996557af867ad0"]
  region                    = var.region
  liquidator_container_name = "${var.liquidator_container_name}-optimism"
}
module "optimism_mainnet_pyth_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.pyth_updater_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "pyth-updater-rpc-0"
  environment         = "mainnet"
  target_chain_id     = local.optimism_mainnet_chain_id
  container_env_vars = merge(
    local.pyth_updater_optimism_lambda_variables,
    { WEB3_HTTP_PROVIDER_URLS = local.optimism_mainnet_rpc_0 }
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 512
}