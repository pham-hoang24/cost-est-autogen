variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region (EU only). Default europe-north1 (Finland)."
  type        = string
  default     = "europe-north1"
}

variable "network_name" {
  description = "VPC network name"
  type        = string
  default     = "ai-sandbox-vpc"
}

variable "subnet_ip_range" {
  description = "Primary subnet CIDR"
  type        = string
  default     = "10.20.0.0/16"
}

variable "sql_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-custom-2-7680"
}

variable "dns_zone_name" {
  description = "Optional Cloud DNS zone name (omit to skip)"
  type        = string
  default     = ""
}

variable "domain" {
  description = "Optional base domain for ingress"
  type        = string
  default     = ""
}



