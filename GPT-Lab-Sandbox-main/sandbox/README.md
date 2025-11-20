# SW4E Sandbox (EU/FI-ready) — GKE Autopilot

Engineering scaffolding for a minimal, production-grade multi-tenant AI sandbox with EU-only defaults, security controls, and compliance hooks. Built for demo/pilots with real isolation, signed images, audit, and governance.

Important: This repository is engineering scaffolding, not legal advice. Validate final processes with counsel and your security/compliance teams.

## TL;DR

1) Bootstrap GCP infra via Terraform (EU-only defaults)
2) Install cluster apps via Helmfile (ingress, certs, monitoring, security, IAM, data)
3) Apply bootstrap manifests (namespaces, RBAC, quotas, netpols)
4) Deploy control-plane API and Next.js UI
5) Build/supply-chain sign template images via GitHub Actions

### Prerequisites

- GCP project with billing enabled
- gcloud CLI, Terraform >= 1.5, kubectl, helm, helmfile
- Cosign, Trivy, Syft (CI will also install)
- Domain (optional) for TLS via cert-manager HTTP-01

### Regions and Residency

- Default region: `europe-north1` (Finland)
- All resources default to EEA-only. Any cross-border options are disabled by default and clearly flagged.

---

## 1) Terraform: EU-only infra

Configure variables in `infra/terraform/variables.tf` or via `terraform.tfvars`.

```bash
cd infra/terraform
terraform init
terraform apply -var="project_id=YOUR_GCP_PROJECT" -var="region=europe-north1"
# Outputs include GKE, SQL, and KMS identifiers.
```

What it creates:
- VPC + Subnet + Cloud NAT (egress)
- GKE Autopilot (Workload Identity enabled)
- Cloud SQL Postgres (private IP)
- Cloud KMS key ring + key
- (Optional) Cloud DNS managed zone

---

## 2) Helmfile: platform apps

```bash
cd infra/helmfile
helmfile sync
```

Installs, in order:
- ingress-nginx
- cert-manager + ClusterIssuer (HTTP-01)
- kube-prometheus-stack + Loki
- Kyverno (+ policy reports)
- Vault (GCP KMS auto-unseal)
- Keycloak (realm/groups)
- MinIO (EU-only buckets)
- MLflow (Cloud SQL backend, MinIO artifacts)
- (Optional) external-dns (Cloud DNS)
- (Optional) Linkerd (mTLS in-cluster)

Verify:
```bash
kubectl get pods -A
kubectl get clusterissuer
```

---

## 3) Bootstrap: namespaces, RBAC, quotas, network

```bash
kubectl apply -f infra/k8s/bootstrap/namespaces.yaml
kubectl apply -f infra/k8s/bootstrap/rbac.yaml
kubectl apply -f infra/k8s/bootstrap/quotas.yaml
kubectl apply -f infra/k8s/bootstrap/default-deny-netpol.yaml
kubectl apply -f infra/k8s/policies/kyverno/
```

Namespaces: `teaching`, `research`, `industry-pilot`.

Kyverno: requires resource limits, denies `:latest`, denies privileged, read-only rootfs, verifies signed images (Cosign keyless), sample egress allowlist.

---

## 4) Control-plane API and UI

### Control-plane API
```bash
cd control-plane
npm install
npm run build
kubectl apply -f k8s/
```
Endpoints (stubs wired):
- `POST/GET /api/projects`
- `POST/GET /api/templates`
- `GET /api/datasets`, `POST /api/datasets/request-access`
- `GET /api/experiments` (MLflow proxy)
- `GET /api/me`
- `POST /api/export-data`, `POST /api/delete-data` (approval flow placeholder)

### UI (Next.js 14)
```bash
cd ui
npm install
npm run build
npm start
```
Features: Dashboard, Projects, Data Catalog, Experiments, Templates, Policies & Compliance, Admin, Help. Auth via Keycloak (next-auth). Strict CSP.

---

## 5) CI and Supply Chain

GitHub Actions (`.github/workflows/build_demo_image.yml`) builds each template image, scans with Trivy, generates SBOM via Syft, signs with Cosign (keyless), and pushes to GHCR. Tags are immutable (SHA/semver). No `:latest`.

Kyverno admission enforces: signed images only, no `:latest`, resource limits set, privileged blocked, read-only root FS.

---

## Smoke tests

```bash
# Ingress and certs
kubectl get ingress -A
kubectl describe clusterissuer letsencrypt-http01

# Kyverno
kubectl get cpol -A
kubectl get policyreport -A

# MLflow + MinIO
kubectl -n mlflow get svc,pods
kubectl -n minio get svc,pods

# UI reachable and authenticates via Keycloak
```

---

## Configuration Notes

- Data residency: EU-only by default. Cross-border toggles are disabled by default and clearly marked.
- Logging/retention: default 30/90 days (configurable). Audit logs exportable, stored in EU.
- Access control: OIDC (Keycloak) + RBAC + namespace isolation. MFA configurable in Keycloak.
- Secrets: Vault; no secrets in Git/env/notebooks.
- Network: default-deny; curated egress allowlist manifest example.
- TLS: cert-manager at ingress; optional Linkerd for mTLS.

Refer to `COMPLIANCE.md` and `SECURITY.md` for checklists, templates, and policies.



