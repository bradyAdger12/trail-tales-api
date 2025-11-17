data "aws_ecr_image" "trail-tales-api-latest-image" {
  repository_name = "personal/trail_tales_api"
  image_tag       = "latest"
}

data "aws_ecr_image" "trail-tales-web-latest-image" {
  repository_name = "personal/trail_tales_web"
  image_tag       = "latest"
}