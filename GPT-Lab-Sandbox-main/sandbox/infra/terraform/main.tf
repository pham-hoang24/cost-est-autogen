locals {
  eu_regions = [
    "europe-north1", "europe-west1", "europe-west2", "europe-west3", "europe-west4",
    "europe-west6", "europe-west8", "europe-west9", "europe-central2"
  ]
}

// Enforce EU-only region
resource "null_resource" "assert_eu_region" {
  triggers = {
    region = var.region
  }
  lifecycle {
    precondition {
      condition     = contains(local.eu_regions, var.region)
      error_message = "Region must be EU-only. Provided: ${var.region}"
    }
  }
}

resource "google_compute_network" "vpc" {
  name                    = var.network_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${var.network_name}-subnet"
  ip_cidr_range = var.subnet_ip_range
  region        = var.region
  network       = google_compute_network.vpc.id
  private_ip_google_access = true
}

resource "google_compute_router" "router" {
  name    = "${var.network_name}-router"
  region  = var.region
  network = google_compute_network.vpc.name
}

resource "google_compute_router_nat" "nat" {
  name                               = "${var.network_name}-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

// GKE Autopilot with Workload Identity (no node keys)
resource "google_container_cluster" "sandbox" {
  name     = "ai-sandbox-autopilot"
  location = var.region
  enable_autopilot = true

  release_channel {
    channel = "REGULAR"
  }

  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.subnet.id

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  deletion_protection = false
}

// Cloud SQL Postgres (private IP)
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

resource "google_compute_global_address" "private_ip_range" {
  name          = "sql-private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_sql_database_instance" "postgres" {
  name             = "ai-sandbox-sql"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = var.sql_tier
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }
    insights_config {
      query_insights_enabled = true
    }
  }
}

// KMS for Vault auto-unseal
resource "google_kms_key_ring" "vault" {
  name     = "ai-sandbox-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "vault_key" {
  name            = "vault-auto-unseal"
  key_ring        = google_kms_key_ring.vault.id
  rotation_period = "7776000s" // 90 days
}

// Optional Cloud DNS
resource "google_dns_managed_zone" "zone" {
  count       = var.dns_zone_name == "" ? 0 : 1
  name        = var.dns_zone_name
  dns_name    = var.domain
  description = "SW4E Sandbox zone"
}



