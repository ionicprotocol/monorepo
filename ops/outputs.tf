output "ecs-cluster" {
  value = module.ecs.ecs_cluster_name
}
output "bsc-mainnet-liquidation-bot" {
  value = module.bsc_mainnet_liquidation_bot.service_name
}

output "bsc-mainnet-twap-bot" {
  value = module.bsc_mainnet_twap_bot.service_name
}

output "bsc-testnet-twap-bot" {
  value = module.bsc_testnet_twap_bot.service_name
}

output "evmos-testnet-liquidation-bot" {
  value = module.evmos_testnet_liquidation_bot.service_name
}

output "moonbeam-mainnet-twap-bot" {
  value = module.moonbeam_mainnet_twap_bot.service_name
}
