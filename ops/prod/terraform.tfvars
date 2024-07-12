ecs_cluster_name   = "opportunity-bot-cluster"
cluster_name = "opportunity-bot-cluster1"
task_definition_family = "my-task-definition"
container_name        = "opportunity_bot"
docker_image          = "058264122535.dkr.ecr.us-east-1.amazonaws.com/liquidator-pyth"
subnet_ids            = ["subnet-09bde9f5ac4ae4112"]
security_group_ids    = ["sg-0a3996557af867ad0"]

autoscaling_group_name = "opportunity_bot_asg"
desired_count  = 2
ecr_repository_name = "liquidator-pyth"
ecs_service_name = "opportunity_bot_service"
