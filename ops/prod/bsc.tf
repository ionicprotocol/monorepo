
locals {
  bsc_mainnet_rpc_0    = "https://bsc-dataseed4.binance.org"
  bsc_mainnet_rpc_1    = "https://rpc.ankr.com/bsc"
  bsc_mainnet_chain_id = "56"
}


# module "bsc_mainnet_oracle_price_change_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "price-change-verifier"
#   environment         = "mainnet"
#   chain_id            = local.bsc_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_price_change_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.bsc_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(2 minutes)"
# }

# module "bsc_mainnet_oracle_feed_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "feed-verifier"
#   environment         = "mainnet"
#   chain_id            = local.bsc_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_feed_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.bsc_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(3 hours)"
# }

# module "bsc_mainnet_oracle_price_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "price-verifier"
#   environment         = "mainnet"
#   chain_id            = local.bsc_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_price_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.bsc_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(20 minutes)"
# }

# module "bsc_mainnet_liquidation_rpc_0" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "liquidator"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "liquidator-rpc-0"
#   environment         = "mainnet"
#   chain_id            = local.bsc_mainnet_chain_id
#   container_env_vars = merge(
#     local.liquidation_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.bsc_mainnet_rpc_0 }
#   )
#   schedule_expression = "rate(4 minutes)"
#   timeout             = 450
#   memory_size         = 128
# }

# module "bsc_mainnet_liquidation_rpc_2" {
#   source              = "../modules/lambda"
#   ecr_repository_name = local.liquidator_ecr_repository_name
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "liquidator-rpc-1"
#   environment         = "mainnet"
#   chain_id            = local.bsc_mainnet_chain_id
#   container_env_vars = merge(
#     local.liquidation_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.bsc_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(2 minutes)"
#   timeout             = 700
#   memory_size         = 256
# }


