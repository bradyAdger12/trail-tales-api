resource "aws_ecs_cluster" "trail_tales_ecs" {
  name = "trail_tales_ecs"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }

  service_connect_defaults {
    namespace = aws_service_discovery_private_dns_namespace.local_namespace.arn
  }
}

resource "aws_ecs_cluster_capacity_providers" "ecs_fargate_provider" {
  cluster_name = aws_ecs_cluster.trail_tales_ecs.name

  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

resource "aws_ecs_service" "trail-tales-api-service" {
  name                              = "trail-tales-api-service"
  cluster                           = aws_ecs_cluster.trail_tales_ecs.id
  task_definition                   = aws_ecs_task_definition.trail-tales-td-api.arn
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 10
  enable_execute_command = true
  desired_count                     = 1
  depends_on                        = [aws_iam_role.ecs_role]

  service_connect_configuration {
    enabled = true
    service {
      discovery_name = "api"
      port_name      = "api"
      client_alias {
        dns_name = "api"
        port     = 8080
      }
    }
     log_configuration {
      log_driver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.trail-tales-api.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "ecs"
      }
    }
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.trail-tales-api-tg.arn
    container_name   = var.api-container-name
    container_port   = 8080
  }

  network_configuration {
    security_groups  = [aws_security_group.ecs_service_api_sg.id]
    assign_public_ip = true
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  }
}

resource "aws_ecs_service" "trail-tales-web-service" {
  name                              = "trail-tales-web-service"
  cluster                           = aws_ecs_cluster.trail_tales_ecs.id
  task_definition                   = aws_ecs_task_definition.trail-tales-td-web.arn
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 10
  enable_execute_command            = true
  desired_count                     = 1
  depends_on                        = [aws_iam_role.ecs_role]

  service_connect_configuration {
    enabled = true
    namespace = "myapp"
    log_configuration {
      log_driver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.trail-tales-web.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "ecs"
      }
    }
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.trail-tales-web-tg.arn
    container_name   = var.web-container-name
    container_port   = 3000
  }

  network_configuration {
    security_groups  = [aws_security_group.ecs_service_web_sg.id]
    assign_public_ip = true
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  }
}

resource "aws_ecs_task_definition" "trail-tales-td-api" {
  family                   = "trail-tales-td-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on               = [aws_cloudwatch_log_group.trail-tales-api, aws_cloudwatch_log_group.trail-tales-web]
  container_definitions = jsonencode([
    {
      name      = var.api-container-name
      image     = "391287955410.dkr.ecr.us-west-2.amazonaws.com/personal/trail_tales_api:latest"
      cpu       = 512
      memory    = 1024
      essential = true
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 10
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.trail-tales-api.name
          awslogs-region        = data.aws_region.current.region
          awslogs-stream-prefix = "ecs"
        }
      }
      environmentFiles = [
        {
          "value" : "${aws_s3_bucket.trail-tales-secret-ba-9348.arn}/prod.env",
          "type" : "s3"
        }
      ],
      portMappings = [
        {
          containerPort = var.api-container-port
          name          = "api"
          appProtocol   = "http"
        }
      ]
    }
  ])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_task_definition" "trail-tales-td-web" {
  family                   = "trail-tales-td-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  depends_on               = [aws_cloudwatch_log_group.trail-tales-api, aws_cloudwatch_log_group.trail-tales-web]
  container_definitions = jsonencode([
    {
      name      = var.web-container-name
      image     = "391287955410.dkr.ecr.us-west-2.amazonaws.com/personal/trail_tales_web:latest"
      cpu       = 512
      memory    = 1024
      essential = true

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 10
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.trail-tales-web.name
          awslogs-region        = data.aws_region.current.region
          awslogs-stream-prefix = "ecs"
        }
      }
      portMappings = [
        {
          name          = "web"
          containerPort = 3000
          appProtocol   = "http"
        }
      ]
    }
  ])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}
