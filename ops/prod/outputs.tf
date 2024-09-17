# MODE
# output "mode-mainnet-liquidation" {
#  value = module.mode_mainnet_liquidation_rpc_0.lambda_cron_service_name
# }
output "base-mainnet-liquidation" {
  value = module.base_mainnet_liquidation_rpc_0.lambda_cron_service_name
}
output "optimism-mainnet-liquidation" {
  value = module.optimism_mainnet_liquidation_rpc_0.lambda_cron_service_name
}
output "ecs_cluster_id" {
  value = aws_ecs_cluster.my_cluster1.id
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.my_cluster1.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.my_cluster1.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.perbotTaskDefinition1.arn
}

