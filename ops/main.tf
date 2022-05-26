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
  source                     = "./modules/twap"
  ecs_cluster_sg             = module.network.ecs_task_sg
  allow_all_sg               = module.network.allow_all_sg
  execution_role_arn         = module.ecr.execution_role_arn
  cluster_id                 = module.ecs.ecs_cluster_id
  docker_image               = var.twap_bot_image
  container_family           = "twap"
  chain_id                   = "56"
  cpu                        = 128
  memory                     = 64
  instance_count             = 1
  timeout                    = 180
  ethereum_admin_account     = var.ethereum_admin_account
  ethereum_admin_private_key = var.ethereum_admin_private_key
  supported_pairs            = "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6|0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
  web3_provider_url          = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/mainnet/archive"
}

module "moonbeam_mainnet_twap_bot" {
  source                     = "./modules/twap"
  ecs_cluster_sg             = module.network.ecs_task_sg
  allow_all_sg               = module.network.allow_all_sg
  execution_role_arn         = module.ecr.execution_role_arn
  cluster_id                 = module.ecs.ecs_cluster_id
  docker_image               = var.twap_bot_image
  container_family           = "twap"
  chain_id                   = "1284"
  cpu                        = 128
  memory                     = 64
  instance_count             = 1
  timeout                    = 180
  ethereum_admin_account     = var.ethereum_admin_account
  ethereum_admin_private_key = var.ethereum_admin_private_key
  supported_pairs            = "0x99588867e817023162F4d4829995299054a5fC57|0xAcc15dC74880C9944775448304B263D191c6077F"
  web3_provider_url          = "https://rpc.api.moonbeam.network"
}

module "bsc_testnet_twap_bot" {
  source                     = "./modules/twap"
  ecs_cluster_sg             = module.network.ecs_task_sg
  allow_all_sg               = module.network.allow_all_sg
  execution_role_arn         = module.ecr.execution_role_arn
  cluster_id                 = module.ecs.ecs_cluster_id
  docker_image               = var.twap_bot_image
  container_family           = "twap"
  chain_id                   = "97"
  cpu                        = 128
  memory                     = 64
  instance_count             = 1
  timeout                    = 180
  ethereum_admin_account     = var.ethereum_admin_account
  ethereum_admin_private_key = var.ethereum_admin_private_key
  supported_pairs            = "0xAE4C99935B1AA0e76900e86cD155BFA63aB77A2a|0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x3129B45b375a11Abf010D2D10DB1E3DcF474A13c|0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd,0x5126C1B8b4368c6F07292932451230Ba53a6eB7A|0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7"
  web3_provider_url          = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/testnet/archive"
}


module "bsc_mainnet_liquidation_bot" {
  source                      = "./modules/liquidation"
  ecs_cluster_sg              = module.network.ecs_task_sg
  allow_all_sg                = module.network.allow_all_sg
  execution_role_arn          = module.ecr.execution_role_arn
  cluster_id                  = module.ecs.ecs_cluster_id
  docker_image                = var.liquidator_bot_image
  container_family            = "liquidation"
  chain_id                    = "56"
  cpu                         = 128
  memory                      = 64
  instance_count              = 1
  timeout                     = 180
  ethereum_admin_account      = var.ethereum_admin_account
  ethereum_admin_private_key  = var.ethereum_admin_private_key
  supported_input_currencies  = "0x0000000000000000000000000000000000000000,0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  supported_output_currencies = "0x0000000000000000000000000000000000000000,0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56,0x2170Ed0880ac9A755fd29B2688956BD959F933F8,0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
  web3_provider_url           = "https://speedy-nodes-nyc.moralis.io/${var.moralis_api_key}/bsc/mainnet/archive"
}


module "evmos_testnet_liquidation_bot" {
  source                      = "./modules/liquidation"
  ecs_cluster_sg              = module.network.ecs_task_sg
  allow_all_sg                = module.network.allow_all_sg
  execution_role_arn          = module.ecr.execution_role_arn
  cluster_id                  = module.ecs.ecs_cluster_id
  docker_image                = var.liquidator_bot_image
  container_family            = "liquidation"
  chain_id                    = "9000"
  cpu                         = 128
  memory                      = 64
  instance_count              = 1
  timeout                     = 180
  ethereum_admin_account      = var.ethereum_admin_account
  ethereum_admin_private_key  = var.ethereum_admin_private_key
  supported_input_currencies  = "0x0000000000000000000000000000000000000000,0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867"
  supported_output_currencies = "0x0000000000000000000000000000000000000000,0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867"
  web3_provider_url           = "https://eth.bd.evmos.dev:8545"
}


module "network" {
  source     = "./modules/networking"
  cidr_block = var.cidr_block
}


module "ecs" {
  source           = "./modules/ecs"
  ecs_cluster_name = "midas-ecs"
}

module "ec2" {
  source                 = "./modules/ec2"
  iam_instance_profile   = module.ecs.iam_instance_profile
  vpc_security_group_ids = [module.network.ecs_task_sg]
  instance_type          = "t3.micro"
  subnet_ids             = module.network.public_subnets
}


module "ecr" {
  source = "./modules/ecr"
}
