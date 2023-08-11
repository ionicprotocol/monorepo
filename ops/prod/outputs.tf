
# BSC
# output "bsc-mainnet-feed-verifier" {
#   value = module.bsc_mainnet_oracle_feed_verifier.lambda_cron_service_name
# }
# output "bsc-mainnet-price-change-verifier" {
#   value = module.bsc_mainnet_oracle_price_change_verifier.lambda_cron_service_name
# }
# output "bsc-mainnet-price-verifier" {
#   value = module.bsc_mainnet_oracle_price_verifier.lambda_cron_service_name
# }
# output "bsc-mainnet-liquidation-1" {
#   value = module.bsc_mainnet_liquidation_rpc_0.lambda_cron_service_name
# }
# output "bsc-mainnet-liquidation-2" {
#   value = module.bsc_mainnet_liquidation_rpc_1.lambda_cron_service_name
# }

# POLYGON
# output "polygon-mainnet-feed-verifier" {
#   value = module.polygon_mainnet_oracle_feed_verifier.lambda_cron_service_name
# }
# output "polygon-mainnet-price-change-verifier" {
#   value = module.polygon_mainnet_oracle_price_change_verifier.lambda_cron_service_name
# }
# output "polygon-mainnet-price-verifier" {
#   value = module.polygon_mainnet_oracle_price_verifier.lambda_cron_service_name
# }
# output "polygon-mainnet-liquidation-1" {
#   value = module.polygon_mainnet_liquidation_rpc_0.lambda_cron_service_name
# }
# output "polygon-mainnet-liquidation-2" {
#   value = module.polygon_mainnet_liquidation_rpc_1.lambda_cron_service_name
# }

# FANTOM
# output "fantom-mainnet-liquidation" {
#   value = module.fantom_mainnet_liquidation_rpc_1.lambda_cron_service_name
# }


# ARBITRUM
# output "arbitrum-mainnet-liquidation" {
#   value = module.arbitrum_mainnet_liquidation_rpc_1.lambda_cron_service_name
# }


# LINEA
output "linea-mainnet-liquidation" {
  value = module.linea_mainnet_liquidation_rpc_0.lambda_cron_service_name
}
# output "linea-mainnet-pyth-updater" {
#   value = module.linea_mainnet_pyth_updater_rpc_0.lambda_cron_service_name
# }

# ZKEVM
output "zkevm-mainnet-liquidation" {
  value = module.zkevm_mainnet_liquidation_rpc_0.lambda_cron_service_name
}
output "zkevm-mainnet-pyth-updater" {
  value = module.zkevm_mainnet_pyth_updater_rpc_0.lambda_cron_service_name
}

