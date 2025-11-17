resource "aws_cloudwatch_log_group" "trail-tales-api" {
  name = "/ecs/trail-tales-api"

  tags = {
    Environment = "production"
    Application = "trail-tales"
  }
}

resource "aws_cloudwatch_log_group" "trail-tales-web" {
  name = "/ecs/trail-tales-web"

  tags = {
    Environment = "production"
    Application = "trail-tales"
  }
}