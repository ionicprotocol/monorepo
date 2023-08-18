


locals {
  polygon_mainnet_rpc_0    = "https://polygon-rpc.com/"
  polygon_mainnet_rpc_1    = "https://rpc.ankr.com/polygon"
  polygon_mainnet_chain_id = "137"


}

# module "polygon_mainnet_oracle_price_change_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "price-change-verifier"
#   environment         = "mainnet"
#   chain_id            = local.polygon_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_price_change_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(2 minutes)"
# }

# module "polygon_mainnet_oracle_feed_verifier" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "oracles-monitor"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "feed-verifier"
#   environment         = "mainnet"
#   chain_id            = local.polygon_mainnet_chain_id
#   container_env_vars = merge(
#     local.oracle_feed_verifier_lambda_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(3 hours)"
# }

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

# module "polygon_mainnet_liquidation_rpc_2" {
#   source              = "../modules/lambda"
#   ecr_repository_name = local.liquidator_ecr_repository_name
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "liquidator-rpc-0"
#   environment         = "mainnet"
#   chain_id            = local.polygon_mainnet_chain_id
#   container_env_vars = merge(
#     local.liquidation_variables,
#     {
#       WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_0,
#       EXCLUDED_COMPTROLLERS  = "0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2"
#     }
#   )
#   schedule_expression = "rate(2 minutes)"
#   timeout             = 700
#   memory_size         = 256
# }

# module "polygon_mainnet_liquidation_rpc_1" {
#   source              = "../modules/lambda"
#   ecr_repository_name = "liquidator"
#   docker_image_tag    = var.bots_image_tag
#   container_family    = "liquidator-rpc-1"
#   environment         = "mainnet"
#   chain_id            = local.polygon_mainnet_chain_id
#   container_env_vars = merge(
#     local.liquidation_variables,
#     { WEB3_HTTP_PROVIDER_URL = local.polygon_mainnet_rpc_1 }
#   )
#   schedule_expression = "rate(4 minutes)"
#   timeout             = 450
#   memory_size         = 128
# }
