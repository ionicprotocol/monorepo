locals {

  linea_mainnet_rpc_0    = "https://linea-mainnet.infura.io/v3/${var.infura_api_key}"
  linea_mainnet_chain_id = "59144"
}


module "linea_mainnet_liquidation_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.liquidator_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator-rpc-0"
  environment         = "mainnet"
  chain_id            = local.linea_mainnet_chain_id
  container_env_vars = merge(
    local.liquidation_variables,
    { WEB3_HTTP_PROVIDER_URL = local.linea_mainnet_rpc_0 }
  )
  schedule_expression = "rate(2 minutes)"
  timeout             = 700
  memory_size         = 256
}


module "linea_mainnet_pyth_updater_rpc_0" {
  source              = "../modules/lambda"
  ecr_repository_name = local.pyth_updater_ecr_repository_name
  docker_image_tag    = var.bots_image_tag
  container_family    = "pyth-updater-rpc-0"
  environment         = "mainnet"
  chain_id            = local.linea_mainnet_chain_id
  container_env_vars = merge(
    local.pyth_updater_lambda_variables,
    { LOG_LEVEL = "debug" },
    { WEB3_HTTP_PROVIDER_URL = local.linea_mainnet_rpc_0 }
  )
  schedule_expression = "rate(5 minutes)"
  timeout             = 700
  memory_size         = 256
}
