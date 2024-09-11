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
  timeout             = 900
  memory_size         = 512
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
  timeout             = 900
  memory_size         = 512
}
