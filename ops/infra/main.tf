terraform {
  backend "s3" {
    bucket = "terraform-statefile-midas-capital"
    key    = "midas-infra"
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

data "aws_caller_identity" "current" {}


module "ecr" {
  source           = "../modules/ecr"
  repository_names = ["oracles-monitor", "liquidator"]
}
