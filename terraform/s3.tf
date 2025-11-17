resource "aws_s3_bucket" "trail-tales-secret-ba-9348" {
  bucket = var.env-bucket-name

  tags = {
    Name        = var.env-bucket-name
    Environment = "Production"
  }
}