
locals {

  bsc_mainnet_rpc_0    = var.chainstack_bsc_rpc_url
  bsc_mainnet_rpc_1    = "https://bsc-dataseed4.binance.org"
  bsc_mainnet_chain_id = "56"

  bsc_excluded_comptrollers = "0xfeB4f9080Ad40ce33Fd47Ff6Da6e4822fE26C7d5"
}


module "bsc_mainnet_oracle_price_change_verifier" {
  source              = "../modules/lambda"
  ecr_repository_name = "oracles-monitor"
  docker_image_tag    = var.oracles_monitor_image_tag
  container_family    = "price-change-verifier"
  environment         = "mainnet"
  chain_id            = local.bsc_mainnet_chain_id
  container_env_vars = merge(
    local.oracle_price_change_verifier_lambda_variables,
    { WEB3_HTTP_PROVIDER_URL = local.bsc_mainnet_rpc_1 }
  )
  schedule_expression = "rate(2 minutes)"
}


module "bsc_mainnet_oracle_monitor" {
  source                  = "../modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.oracles_monitor_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "oracles-monitor"
  chain_id                = local.bsc_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.bsc_mainnet_rpc_1]
  runtime_env_vars = concat(local.oracles_variables, [
    { name = "TARGET_CHAIN_ID", value = local.bsc_mainnet_chain_id },
  ])
}

module "bsc_mainnet_liquidation_cron" {
  source                  = "../modules/cron"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = "ghcr.io/midas-protocol/liquidator:sha-825e38342e563cf1a7e309fed344d56e5424d08e"
  region                  = var.region
  environment             = "mainnet"
  container_family        = "liquidation-cron"
  chain_id                = local.bsc_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls = [
    # local.bsc_mainnet_rpc_0,
    local.bsc_mainnet_rpc_1
  ]
  runtime_env_vars = concat(local.liquidation_variables, [
    { name = "TARGET_CHAIN_ID", value = local.bsc_mainnet_chain_id },
    { name = "EXCLUDED_COMPTROLLERS", value = local.bsc_excluded_comptrollers },
  ])
  ecs_cluster_arn     = module.ecs.ecs_cluster_arn
  schedule_expression = "rate(2 minutes)"
}

