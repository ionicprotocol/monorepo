locals {
  mode_mainnet_rpc_0    = "https://mainnet.mode.network"
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
    { WEB3_HTTP_PROVIDER_URL = local.mode_mainnet_rpc_0 }
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 512
}