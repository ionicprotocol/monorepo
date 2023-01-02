output "ecs-cluster" {
  value = module.ecs.ecs_cluster_name
}
output "bsc-mainnet-liquidation-cron" {
  value = module.bsc_mainnet_liquidation_cron.service_name
}

output "bsc-mainnet-oracle-monitor" {
  value = module.bsc_mainnet_oracle_monitor.service_name
}

output "polygon-mainnet-liquidation-cron" {
  value = module.polygon_mainnet_liquidation_cron.service_name
}

output "polygon-mainnet-oracle-monitor" {
  value = module.polygon_mainnet_oracle_monitor.service_name
}

output "moonbeam-mainnet-liquidation-cron" {
  value = module.moonbeam_mainnet_liquidation_cron.service_name
}

