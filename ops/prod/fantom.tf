locals {

  fantom_mainnet_rpc_0    = "https://rpcapi.fantom.network"
  fantom_mainnet_rpc_1    = "https://rpc.ankr.com/fantom"
  fantom_mainnet_chain_id = "250"
}


module "fantom_mainnet_liquidation_rpc_1" {
  source              = "../modules/lambda"
  ecr_repository_name = "liquidator"
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator"
  environment         = "mainnet"
  chain_id            = local.fantom_mainnet_chain_id
  container_env_vars = merge(
    local.liquidation_variables,
    { WEB3_HTTP_PROVIDER_URL = local.fantom_mainnet_rpc_1 }
  )
  schedule_expression = "rate(2 minutes)"
  timeout             = 250
  memory_size         = 128
}


