
resource "aws_ecr_repository" "name" {
  for_each = toset(var.repository_names)
  name     = each.value
}

resource "aws_ecr_lifecycle_policy" "keep_last_15_images" {
  for_each   = aws_ecr_repository.name
  repository = each.value.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Expire images older than 7 days",
            "selection": {
                "tagStatus": "any",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 7
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}
