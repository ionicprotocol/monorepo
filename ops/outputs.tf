output "ecs-cluster" {
  value = module.ecs.ecs_cluster_name
}
output "bsc-mainnet-liquidation-bot" {
  value = module.bsc_mainnet_liquidation_bot.service_name
}

output "bsc-mainnet-twap-bot" {
  value = module.bsc_mainnet_twap_bot.service_name
}

output "bsc-mainnet-oracle-monitor" {
  value = module.bsc_mainnet_oracle_monitor.service_name
}

output "polygon-mainnet-liquidation-bot" {
  value = module.polygon_mainnet_liquidation_bot.service_name
}

output "polygon-mainnet-oracle-monitor" {
  value = module.polygon_mainnet_oracle_monitor.service_name
}
output "moonbeam-mainnet-twap-bot" {
  value = module.moonbeam_mainnet_twap_bot.service_name
}
