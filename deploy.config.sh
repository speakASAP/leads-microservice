# deploy.config.sh — declaration consumed by shared/scripts/deploy.sh.
# See shared/docs/DEPLOY_STANDARDIZATION_REPORT.md section 6/7 (Phase C) for the design.
# scripts/deploy.sh is still the live, authoritative deploy path.

SERVICE_NAME="leads-microservice"
PORT="4400"

IMAGES=(
  "leads-microservice|.||"
)

DEPLOYMENTS=(
  "leads-microservice|app|leads-microservice"
)

# Real script order: configmap, external-secret, service, ingress, deployment
# (deployment last) — preserved rather than reordered.
MANIFESTS=(configmap.yaml external-secret.yaml service.yaml ingress.yaml deployment.yaml)
