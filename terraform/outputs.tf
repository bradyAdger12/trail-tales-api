output "s3_bucket_name" {
    description = "ARN of S3 bucket"
    value = aws_s3_bucket.trail-tales-secret-ba-9348.arn
}

output "default_aws_region" {
    description = "default region"
    value = data.aws_region.current.region
}

output "alb_url" {
    description = "URL of ALB"
    value = aws_lb.trail-tales-alb.dns_name
}