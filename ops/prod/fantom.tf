locals {

  fantom_mainnet_rpc_0    = "https://rpcapi.fantom.network"
  fantom_mainnet_rpc_1    = "https://rpc.ankr.com/fantom"
  fantom_mainnet_chain_id = "250"
}


module "fantom_mainnet_liquidation_cron" {
  source                  = "../modules/cron"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = "ghcr.io/midas-protocol/liquidator:${var.bots_image_tag}"
  region                  = var.region
  environment             = "mainnet"
  container_family        = "liquidation-cron"
  chain_id                = local.fantom_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.fantom_mainnet_rpc_1]
  runtime_env_vars = concat(local.liquidation_variables, [
    { name = "TARGET_CHAIN_ID", value = local.fantom_mainnet_chain_id },
  ])
  ecs_cluster_arn     = module.ecs.ecs_cluster_arn
  schedule_expression = "rate(2 minutes)"
}
