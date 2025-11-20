output "gke_name" {
  value       = google_container_cluster.sandbox.name
  description = "GKE Autopilot cluster name"
}

output "gke_location" {
  value       = google_container_cluster.sandbox.location
  description = "GKE location"
}

output "kube_endpoint" {
  value       = google_container_cluster.sandbox.endpoint
  description = "Kubernetes API endpoint"
}

output "sql_connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "Cloud SQL connection name"
}

output "kms_key_id" {
  value       = google_kms_crypto_key.vault_key.id
  description = "KMS key for Vault auto-unseal"
}

output "network" {
  value       = google_compute_network.vpc.name
  description = "VPC network name"
}

output "subnet" {
  value       = google_compute_subnetwork.subnet.name
  description = "Subnet name"
}



