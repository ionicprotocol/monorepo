output "ecs-cluster" {
  value = module.ecs.ecs_cluster_name
}

# Liquidators
output "bsc-mainnet-liquidation-cron" {
  value = module.bsc_mainnet_liquidation_cron.service_name
}

output "polygon-mainnet-liquidation-cron" {
  value = module.polygon_mainnet_liquidation_cron.service_name
}

output "moonbeam-mainnet-liquidation-cron" {
  value = module.moonbeam_mainnet_liquidation_cron.service_name
}


# Verifiers
output "bsc-mainnet-feed-verifier" {
  value = module.bsc_mainnet_oracle_feed_verifier.lambda_cron_service_name
}
output "bsc-mainnet-price-change-verifier" {
  value = module.bsc_mainnet_oracle_price_change_verifier.lambda_cron_service_name
}
output "bsc-mainnet-price-verifier" {
  value = module.bsc_mainnet_oracle_price_verifier.lambda_cron_service_name
}


output "polygon-mainnet-feed-verifier" {
  value = module.polygon_mainnet_oracle_feed_verifier.lambda_cron_service_name
}
output "polygon-mainnet-price-change-verifier" {
  value = module.polygon_mainnet_oracle_price_change_verifier.lambda_cron_service_name
}
output "polygon-mainnet-price-verifier" {
  value = module.polygon_mainnet_oracle_price_verifier.lambda_cron_service_name
}

output "moonbeam-mainnet-feed-verifier" {
  value = module.moonbeam_mainnet_oracle_feed_verifier.lambda_cron_service_name
}
output "moonbeam-mainnet-price-change-verifier" {
  value = module.moonbeam_mainnet_oracle_price_change_verifier.lambda_cron_service_name
}
output "moonbeam-mainnet-price-verifier" {
  value = module.moonbeam_mainnet_oracle_price_verifier.lambda_cron_service_name
}

