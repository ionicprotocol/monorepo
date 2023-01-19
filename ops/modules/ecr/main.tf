
resource "aws_ecr_repository" "name" {
  for_each = toset(var.repository_names)
  name     = each.value
}
