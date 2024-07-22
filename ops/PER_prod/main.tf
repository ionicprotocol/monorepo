terraform {
  backend "s3" {
    bucket = "terraform-statefile-ionicprotocol-based"
    key    = "PER_prod/ionic-deployment"
    region = "eu-central-1"
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
