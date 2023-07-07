locals {

  arbitrum_mainnet_rpc_0    = "https://arb1.arbitrum.io/rpc"
  arbitrum_mainnet_rpc_1    = "https://rpc.ankr.com/arbitrum"
  arbitrum_mainnet_chain_id = "42161"
}


module "arbitrum_mainnet_liquidation_rpc_1" {
  source              = "../modules/lambda"
  ecr_repository_name = local.liquidator_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator-rpc-1"
  environment         = "mainnet"
  chain_id            = local.arbitrum_mainnet_chain_id
  container_env_vars = merge(
    local.liquidation_variables,
    { WEB3_HTTP_PROVIDER_URL = local.arbitrum_mainnet_rpc_1 }
  )
  schedule_expression = "rate(2 minutes)"
  timeout             = 700
  memory_size         = 256
}


