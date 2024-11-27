ecs_cluster_name   = "opportunity-bot-cluster"
cluster_name = "opportunity-bot-cluster1"
liquidator_cluster_name = "liquidator-cluster"
task_definition_family = "perbotTaskDefinition"
container_name        = "opportunity_bot"
liquidator_container_name  = "liquidator_bot_container"
docker_image          = "058264122535.dkr.ecr.eu-central-1.amazonaws.com/liquidator-pyth"
subnet_ids            = ["subnet-0a14dc2f0f924ea57"]
security_group_ids    = ["sg-05ff9ea594c31fbe8"]

autoscaling_group_name = "opportunity_bot_asg"
desired_count  = 1
ecr_repository_name = "liquidator-pyth"
ecs_service_name = "opportunity_bot_service"

liquidator_service_name = "liquidator-service"
task_definition_family_optimism = "liquidator-optimism"
task_definition_family_base = "liquidator-base"
task_definition_family_mode = "liquidator-mode"
task_definition_family_lisk = "liquidator-lisk"
task_definition_family_fraxtal = "liquidator-fraxtal"
