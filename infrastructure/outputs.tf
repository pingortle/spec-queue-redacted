output "master_dns" {
  value = "${aws_instance.web.public_dns}"
}
