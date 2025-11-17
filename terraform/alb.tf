
resource "aws_security_group" "alb_sg" {
  name        = "alb_sg"
  description = "Allow TLS inbound traffic and all outbound traffic"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "ECS Service SG"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_internet_traffic" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}


resource "aws_vpc_security_group_egress_rule" "allow_all_outbound_alb" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_lb_target_group" "trail-tales-api-tg" {
  name        = "trail-tales-api-tg"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
}

resource "aws_lb_target_group" "trail-tales-web-tg" {
  name        = "trail-tales-web-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
}

resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.trail-tales-alb-listener.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.trail-tales-api-tg.arn
  }

  transform {
    type = "url-rewrite"
    url_rewrite_config {
      rewrite {
        regex   = "/api/*"
        replace = "/"
      }
    }
  }
  
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "web_rule" {
  listener_arn = aws_lb_listener.trail-tales-alb-listener.arn
  priority     = 2

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.trail-tales-web-tg.arn
  }
  

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

resource "aws_lb_listener" "trail-tales-alb-listener" {
  load_balancer_arn = aws_lb.trail-tales-alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.trail-tales-api-tg.arn
  }
}

resource "aws_lb" "trail-tales-alb" {
  name               = "trail-tales-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  enable_deletion_protection = false

  tags = {
    Environment = "production"
  }
}
