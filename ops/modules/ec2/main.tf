###########################################################
# AWS ECS-EC2
###########################################################



data "aws_ami" "default" {
  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-2.0.202*-x86_64-ebs"]
  }

  most_recent = true
  owners      = ["amazon"]
}


resource "aws_launch_configuration" "default" {
  associate_public_ip_address = true
  iam_instance_profile        = var.iam_instance_profile
  image_id                    = "ami-036be9830ccba80a8"
  instance_type               = var.instance_type

  lifecycle {
    create_before_destroy = true
  }

  name_prefix     = "lauch-configuration-"
  security_groups = var.vpc_security_group_ids
  user_data       = file("${path.module}/user_data.sh")
}


resource "aws_autoscaling_group" "default" {
  desired_capacity     = 1
  health_check_type    = "EC2"
  launch_configuration = aws_launch_configuration.default.name
  max_size             = 2
  min_size             = 1
  name                 = "auto-scaling-group"
  termination_policies = ["OldestInstance"]

  lifecycle {
    create_before_destroy = true
  }
}

