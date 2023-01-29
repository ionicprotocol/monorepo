
locals {
  moonbeam_mainnet_rpc_0    = "https://moonbeam.public.blastapi.io"
  moonbeam_mainnet_rpc_1    = "https://rpc.ankr.com/moonbeam"
  moonbeam_mainnet_chain_id = "1284"
}


module "moonbeam_mainnet_oracle_price_change_verifier" {
  source              = "../modules/lambda"
  ecr_repository_name = "oracles-monitor"
  docker_image_tag    = var.bots_image_tag
  container_family    = "price-change-verifier"
  environment         = "mainnet"
  chain_id            = local.moonbeam_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_price_change_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.moonbeam_mainnet_rpc_0 }
  )
  schedule_expression = "rate(2 minutes)"
}


module "moonbeam_mainnet_oracle_feed_verifier" {
  source              = "../modules/lambda"
  ecr_repository_name = "oracles-monitor"
  docker_image_tag    = var.bots_image_tag
  container_family    = "feed-verifier"
  environment         = "mainnet"
  chain_id            = local.moonbeam_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_feed_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.moonbeam_mainnet_rpc_1 }
  )
  schedule_expression = "rate(3 hours)"
}

# module "moonbeam_mainnet_oracle_price_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "price-verifier"
#   environment         = "mainnet"
#   chain_id            = local.moonbeam_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_price_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.moonbeam_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(20 minutes)"
# }

module "moonbeam_mainnet_liquidation" {
  source              = "../modules/lambda"
  ecr_repository_name = "liquidator"
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator"
  environment         = "mainnet"
  chain_id            = local.moonbeam_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_price_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.moonbeam_mainnet_rpc_1 }
  )
  schedule_expression = "rate(2 minutes)"
}


