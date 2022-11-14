terraform {
  backend "s3" {
    bucket = "terraform-statefile-midas-capital"
    key    = "midas-deployment"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}


module "polygon_mainnet_oracle_monitor" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.oracles_monitor_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "oracles-monitor"
  chain_id                = local.polygon_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.polygon_mainnet_rpc_0]
  runtime_env_vars = concat(local.oracles_variables, [
    { name = "TARGET_CHAIN_ID", value = local.polygon_mainnet_chain_id },
  ])
}


module "bsc_mainnet_oracle_monitor" {
  source                  = "./modules/bot"
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
  provider_urls           = [local.bsc_mainnet_rpc_0]
  runtime_env_vars = concat(local.oracles_variables, [
    { name = "TARGET_CHAIN_ID", value = local.bsc_mainnet_chain_id },
  ])
}


module "bsc_mainnet_liquidation_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.liquidator_bot_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "liquidation"
  chain_id                = local.bsc_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.bsc_mainnet_rpc_0, local.bsc_mainnet_rpc_1]
  runtime_env_vars = concat(local.liquidation_variables, [
    { name = "TARGET_CHAIN_ID", value = local.bsc_mainnet_chain_id },
  ])
}

module "polygon_mainnet_liquidation_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.liquidator_bot_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "liquidation"
  chain_id                = local.polygon_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.polygon_mainnet_rpc_0, local.polygon_mainnet_rpc_1]
  runtime_env_vars = concat(local.liquidation_variables, [
    { name = "TARGET_CHAIN_ID", value = local.polygon_mainnet_chain_id },
  ])
}

module "moonbeam_mainnet_liquidation_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.liquidator_bot_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "liquidation"
  chain_id                = local.moonbeam_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.moonbeam_mainnet_rpc_0, local.moonbeam_mainnet_rpc_1]
  runtime_env_vars = concat(local.liquidation_variables, [
    { name = "TARGET_CHAIN_ID", value = local.moonbeam_mainnet_chain_id },
  ])
}


module "ecs_alerting" {
  source              = "./modules/alerts"
  name                = "ecs-bots-service-status-monitor"
  discord_webhook_url = var.ecs_notifier_discord_webhook_url
}

module "network" {
  source     = "./modules/networking"
  cidr_block = var.cidr_block
}


module "ecs" {
  source           = "./modules/ecs"
  ecs_cluster_name = "midas-bots"
}

module "iam" {
  source = "./modules/iam"
}
