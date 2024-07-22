terraform {
  backend "s3" {
    bucket = "terraform-statefile-ionicprotocol-based"
    key    = "PER_prod/ionic-deployment"
    region = "us-east-1"  # Region of the S3 bucket
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"  # Region for infrastructure
}
