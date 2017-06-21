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
  source        = "git::ssh://git@lab.***REMOVED***.com/***REMOVED***/terraform.git?ref=v1.0.4"
  name          = "spec-queue-stack"
  keypair       = "spec-queue"
  ecs_instance_type = "m4.large"
}

resource "aws_instance" "web" {
  ami                         = "ami-ad4b33bb"
  instance_type               = "m4.large"
  monitoring                  = true
  associate_public_ip_address = true
  key_name                    = "spec-queue"
  vpc_security_group_ids      = ["${module.stack.public_sg}", "${module.stack.private_sg}"]

  tags {
    Name = "spec-queue-master"
  }
}
