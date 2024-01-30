terraform {
  backend "s3" {
    bucket = "terraform-statefile-ionicprotocol-based"
    key    = "ionic-deployment"
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
