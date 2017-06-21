output "master_dns" {
  value = "${aws_instance.web.public_dns}"
}

output "iam_role" {
value = "${module.stack.iam_role}"
}
