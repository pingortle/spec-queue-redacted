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

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-trusty-14.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "web" {
  ami                         = "${data.aws_ami.ubuntu.id}"
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  key_name                    = "spec-queue"
  vpc_security_group_ids      = ["${module.stack.public_sg}", "${module.stack.private_sg}"]

  tags {
    Name = "spec-queue-master"
  }
}
