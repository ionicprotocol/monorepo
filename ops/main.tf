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
  chain_id                = "56"
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "WEB3_HTTP_PROVIDER_URL", value = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/mainnet/archive" },
    { name = "SUPPORTED_PAIRS", value = "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6|0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c" },
    { name = "TARGET_CHAIN_ID", value = "56" },
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
  chain_id                = "1284"
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "WEB3_HTTP_PROVIDER_URL", value = "https://rpc.api.moonbeam.network" },
    { name = "SUPPORTED_PAIRS", value = "0x99588867e817023162F4d4829995299054a5fC57|0xAcc15dC74880C9944775448304B263D191c6077F" },
    { name = "TARGET_CHAIN_ID", value = "1284" },
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
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "WEB3_HTTP_PROVIDER_URL", value = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/testnet/archive" },
    { name = "SUPPORTED_PAIRS", value = "0xAE4C99935B1AA0e76900e86cD155BFA63aB77A2a|0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x3129B45b375a11Abf010D2D10DB1E3DcF474A13c|0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x5126C1B8b4368c6F07292932451230Ba53a6eB7A|0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7" },
    { name = "TARGET_CHAIN_ID", value = "97" },
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
  chain_id                = "56"
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "WEB3_HTTP_PROVIDER_URL", value = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/mainnet/archive" },
    { name = "TARGET_CHAIN_ID", value = "56" },
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
  chain_id                = "9000"
  cpu                     = 256
  memory                  = 512
  instance_count          = 1
  subnets                 = module.network.public_subnets
  runtime_env_vars = concat(local.secret_env_vars, [
    { name = "WEB3_HTTP_PROVIDER_URL", value = "https://eth.bd.evmos.dev:8545" },
    { name = "TARGET_CHAIN_ID", value = "9000" },
  ])
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
