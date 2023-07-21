output "public_subnets" {
  value = aws_subnet.main.*.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "ecs_task_sg" {
  value = aws_security_group.allow_all.id
}