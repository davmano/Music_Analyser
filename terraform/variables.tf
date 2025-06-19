variable "aws_region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "music-analyzer-eks"
}

variable "cluster_version" {
  default = "1.29"
}

variable "instance_type" {
  default = "t3.medium"
}

variable "desired_capacity" {
  default = 2
}

variable "max_size" {
  default = 3
}

variable "min_size" {
  default = 1
}
