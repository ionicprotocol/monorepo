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

module "bsc_mainnet_twap_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.twap_bot_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "twap"
  chain_id                = local.bsc_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.bsc_mainnet_rpc_0, local.bsc_mainnet_rpc_1]
  runtime_env_vars = concat(local.secret_env_vars, local.twap_bot_env_vars, [
    { name = "SUPPORTED_PAIRS", value = local.bsc_mainnet_supported_pais },
    { name = "TARGET_CHAIN_ID", value = local.bsc_mainnet_chain_id },
  ])
}

module "moonbeam_mainnet_twap_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.twap_bot_image
  region                  = var.region
  environment             = "mainnet"
  container_family        = "twap"
  chain_id                = local.moonbeam_mainnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.moonbeam_mainnet_rpc_1]
  runtime_env_vars = concat(local.secret_env_vars, local.twap_bot_env_vars, [
    { name = "SUPPORTED_PAIRS", value = local.moonbeam_mainnet_supported_pais },
    { name = "TARGET_CHAIN_ID", value = local.moonbeam_mainnet_chain_id },
  ])
}

module "bsc_testnet_twap_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.twap_bot_image
  region                  = var.region
  environment             = "testnet"
  container_family        = "twap"
  chain_id                = "97"
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.bsc_testnet_rpc]
  runtime_env_vars = concat(local.secret_env_vars, local.twap_bot_env_vars, [
    { name = "SUPPORTED_PAIRS", value = local.bsc_testnet_supported_pais },
    { name = "TARGET_CHAIN_ID", value = local.bsc_testnet_chain_id },
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
  provider_urls           = [local.bsc_mainnet_rpc_0, local.bsc_mainnet_rpc_2]
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "TARGET_CHAIN_ID", value = local.bsc_mainnet_chain_id },
  ])
}

module "evmos_testnet_liquidation_bot" {
  source                  = "./modules/bot"
  service_security_groups = module.network.ecs_task_sg
  execution_role_arn      = module.iam.execution_role_arn
  cluster_id              = module.ecs.ecs_cluster_id
  docker_image            = var.liquidator_bot_image
  region                  = var.region
  environment             = "testnet"
  container_family        = "liquidation"
  chain_id                = local.evmos_testnet_chain_id
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  provider_urls           = [local.evmos_testnet_rpc]
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "TARGET_CHAIN_ID", value = local.evmos_testnet_chain_id },
  ])
}


module "ecs_alerting" {
  source              = "./modules/alerts"
  name                = "ecs-bots-service-status-monitor"
  discord_webhook_url = var.discord_webhook_url
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
