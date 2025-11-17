resource "aws_service_discovery_private_dns_namespace" "local_namespace" {
  name        = "myapp"
  description = "Private DNS namespace used for Trail Tales app"
  vpc         = aws_vpc.main.id
}