terraform {
  backend "s3" {
    bucket = "terraform-statefile-midas-capital"
    key    = "midas-deployment"
    region = "us-east-1"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}

module "network" {
  source     = "../modules/networking"
  cidr_block = var.cidr_block
}

module "ecs" {
  source           = "../modules/ecs"
  ecs_cluster_name = "midas-bots"
}

module "iam" {
  source = "../modules/iam"
}
