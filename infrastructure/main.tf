provider "aws" {
  access_key = "${var.aws_access_key}"
  secret_key = "${var.aws_secret_key}"
  region     = "${var.aws_region}"
}

terraform {
  backend "s3" {
    bucket = "spec-queue-infrastructure-tfstate"
    key    = "terraform.tfstate"
    region = "us-west-2"
  }
}

module "stack" {
  source  = "git::ssh://git@lab.***REMOVED***.com/***REMOVED***/terraform.git?ref=v1.0.4"
  name    = "spec-queue-stack"
  keypair = "spec-queue"
}
