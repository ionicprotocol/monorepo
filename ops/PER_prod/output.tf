output "ecs_cluster_id" {
  value = aws_ecs_cluster.my_cluster.id
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.my_cluster.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.my_cluster.name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.perbotTaskDefinition.arn
}