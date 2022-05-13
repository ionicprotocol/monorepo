output "ecs-cluster" {
  value = module.ecs.ecs_cluster_name
}

output "bsc-testnet-liquidation-bot" {
  value = module.bsc_mainnet_liquidation_bot.service_name
}

output "evmos-testnet-liquidation-bot" {
  value = module.evmos_testnet_liquidation_bot.service_name
}
