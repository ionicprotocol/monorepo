ecs_cluster_name   = "opportunity-bot-cluster"
cluster_name = "opportunity-bot-cluster1"
task_definition_family = "my-task-definition"
container_name        = "opportunity_bot"
docker_image          = "058264122535.dkr.ecr.us-east-1.amazonaws.com/liquidator-pyth"
subnet_ids            = ["sg-0a3996557af867ad0"]
security_group_ids    = ["subnet-09bde9f5ac4ae4112"]
autoscaling_group_name = "opportunity_bot_asg"
container_port = 80
host_port      = 8080
desired_count  = 2
ecr_repository_name = "liquidator-pyth"
ecs_service_name = "opportunity_bot_service"
