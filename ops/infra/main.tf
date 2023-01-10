terraform {
  backend "s3" {
    bucket = "terraform-statefile-midas-capital"
    key    = "midas-infra"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}


module "ecr" {
  source           = "../modules/ecr"
  repository_names = ["oracle-monitor", "liquidation"]
  registry_replication_rules = [
    {
      destinations = [
        {
          region      = "us-east-1"
          registry_id = data.aws_caller_identity.current.account_id
        },
        {
          region      = "us-west-1"
          registry_id = data.aws_caller_identity.current.account_id
        }
      ]
    }
  ]
}
