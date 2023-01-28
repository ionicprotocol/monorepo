


locals {
  polygon_mainnet_rpc_0    = var.chainstack_polygon_rpc_url
  polygon_mainnet_rpc_1    = "https://polygon-rpc.com/"
  polygon_mainnet_chain_id = "137"


}

module "polygon_mainnet_oracle_price_change_verifier" {
  source              = "../modules/lambda"
  ecr_repository_name = "oracles-monitor"
  docker_image_tag    = var.bots_image_tag
  container_family    = "price-change-verifier"
  environment         = "mainnet"
  chain_id            = local.polygon_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_price_change_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
  )
  schedule_expression = "rate(2 minutes)"
}

module "polygon_mainnet_oracle_feed_verifier" {
  source              = "../modules/lambda"
  ecr_repository_name = "oracles-monitor"
  docker_image_tag    = var.bots_image_tag
  container_family    = "feed-verifier"
  environment         = "mainnet"
  chain_id            = local.polygon_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_feed_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
  )
  schedule_expression = "rate(3 hour)"
}

# module "polygon_mainnet_oracle_price_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "price-verifier"
#   environment         = "mainnet"
#   chain_id            = local.polygon_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_price_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(20 minutes)"
# }

module "polygon_mainnet_liquidation" {
  source              = "../modules/lambda"
  ecr_repository_name = "liquidator"
  docker_image_tag    = var.bots_image_tag
  container_family    = "liquidator"
  environment         = "mainnet"
  chain_id            = local.polygon_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_price_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
  )
  schedule_expression = "rate(2 minutes)"
}
