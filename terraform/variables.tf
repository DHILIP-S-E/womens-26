variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "womens-safety"
}

variable "database_url" {
  description = "PostgreSQL connection string for Lambda functions"
  type        = string
  sensitive   = true
}

variable "sns_phone_number" {
  description = "Default SMS phone number for notifications"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}
