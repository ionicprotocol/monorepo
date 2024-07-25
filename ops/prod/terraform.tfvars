ecs_cluster_name   = "opportunity-bot-cluster"
cluster_name = "opportunity-bot-cluster1"
task_definition_family = "perbotTaskDefinition"
container_name        = "opportunity_bot"
docker_image          = "058264122535.dkr.ecr.eu-central-1.amazonaws.com/liquidator-pyth"
subnet_ids            = ["subnet-0a14dc2f0f924ea57"]
security_group_ids    = ["sg-05ff9ea594c31fbe8"]

autoscaling_group_name = "opportunity_bot_asg"
desired_count  = 1
ecr_repository_name = "liquidator-pyth"
ecs_service_name = "opportunity_bot_service"