data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block = var.cidr_block

}

resource "aws_subnet" "main" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  availability_zone       = data.aws_availability_zones.available.names[count.index]
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, var.az_count + count.index)
  depends_on              = [aws_internet_gateway.main]
  map_public_ip_on_launch = true

}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

}

# Route the public subnet traffic through the IGW
resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.main.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}


resource "aws_security_group" "allow_all" {
  name        = "allow_all"
  description = "Allow all inbound traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

}
