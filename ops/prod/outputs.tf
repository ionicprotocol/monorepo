# MODE
output "mode-mainnet-liquidation" {
  value = module.mode_mainnet_liquidation_rpc_0.lambda_cron_service_name
}
output "base-mainnet-liquidation" {
  value = module.base_mainnet_liquidation_rpc_0.lambda_cron_service_name
}
output "optimism-mainnet-liquidation" {
  value = module.optimism_mainnet_liquidation_rpc_0.lambda_cron_service_name
}