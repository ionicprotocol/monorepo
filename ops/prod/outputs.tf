# MODE
# output "mode-mainnet-liquidation" {
#  value = module.mode_mainnet_liquidation_rpc_0.lambda_cron_service_name
# }
# Add ECS outputs if needed
output "base_mainnet_liquidator_ecs_service" {
  value = module.base_mainnet_liquidator_ecs.task_definition_arn
}

output "optimism_mainnet_liquidator_ecs_service" {
  value = module.optimism_mainnet_liquidator_ecs.task_definition_arn
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

output "debug_task_definition_families" {
  value = {
    base = var.task_definition_family_base
    optimism = var.task_definition_family_optimism
    mode = var.task_definition_family_mode
  }
}

