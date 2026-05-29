#!/bin/bash
# deploy.sh - Kubernetes deployment for leads-microservice
# Usage: ./scripts/deploy.sh [image-tag]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# shellcheck disable=SC1091
source "$(dirname "$PROJECT_ROOT")/shared/scripts/load-deploy-phase-timing.sh" "$PROJECT_ROOT" 2>/dev/null \
  || source "$HOME/Documents/Github/shared/scripts/load-deploy-phase-timing.sh" "$PROJECT_ROOT" \
  || { echo "Error: deploy timing library not found" >&2; exit 1; }
deploy_timing_init "leads-microservice"

SERVICE_NAME="leads-microservice"
NAMESPACE="${K8S_NAMESPACE:-statex-apps}"
REGISTRY="${K8S_REGISTRY:-localhost:5000}"
DEFAULT_TAG="$(cd "$PROJECT_ROOT" && git rev-parse --short HEAD 2>/dev/null || echo "build-$(date -u +%Y%m%d%H%M%S)")"
IMAGE_TAG="${1:-$DEFAULT_TAG}"
IMAGE="${REGISTRY}/${SERVICE_NAME}:${IMAGE_TAG}"
IMAGE_LATEST="${REGISTRY}/${SERVICE_NAME}:latest"
K8S_DIR="$PROJECT_ROOT/k8s"

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { local level="$1"; shift; printf "[%s] [%s] %s\n" "$(ts)" "$level" "$*"; }
phase() { echo -e "${BLUE}[$(ts)] $*${NC}"; }

on_error() {
  local exit_code="$?"
  echo -e "${RED}[$(ts)] Deployment failed with exit code ${exit_code}${NC}" >&2
  log ERROR "Collecting diagnostics for root-cause analysis..."
  kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME" -o wide || true
  kubectl describe deployment "$SERVICE_NAME" -n "$NAMESPACE" || true
  kubectl describe externalsecret "${SERVICE_NAME}-secret" -n "$NAMESPACE" || true
  kubectl get events -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp | tail -n 30 || true
  local pod
  pod="$(kubectl get pod -n "$NAMESPACE" -l app="$SERVICE_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"
  if [ -n "$pod" ]; then
    kubectl logs -n "$NAMESPACE" "$pod" --tail=200 || true
  fi
  exit "$exit_code"
}
trap on_error ERR

if [ ! -d "$K8S_DIR" ]; then
  echo -e "${RED}Missing k8s directory: $K8S_DIR${NC}"
  exit 1
fi

phase "╔════════════════════════════════════════════════════════════╗"
phase "║        leads-microservice Kubernetes Deployment            ║"
phase "╚════════════════════════════════════════════════════════════╝"

deploy_timing_phase_start "Build image"
phase "[1/7] Build image ${IMAGE}"
docker build -t "$IMAGE" -t "$IMAGE_LATEST" "$PROJECT_ROOT"
log INFO "Image build completed"
deploy_timing_phase_end "Build image"

deploy_timing_phase_start "Push image"
phase "[2/7] Push image to local registry"
docker push "$IMAGE"
docker push "$IMAGE_LATEST"
log INFO "Image push completed"
deploy_timing_phase_end "Push image"

deploy_timing_phase_start "Apply ConfigMap and ExternalSecret"
phase "[3/7] Apply ConfigMap and ExternalSecret (Vault-managed)"
kubectl apply -f "$K8S_DIR/configmap.yaml" -n "$NAMESPACE"
kubectl apply -f "$K8S_DIR/external-secret.yaml" -n "$NAMESPACE"
log INFO "ConfigMap and ExternalSecret applied"
deploy_timing_phase_end "Apply ConfigMap and ExternalSecret"

deploy_timing_phase_start "Apply Service and Ingress"
phase "[4/7] Apply Service and Ingress"
kubectl apply -f "$K8S_DIR/service.yaml" -n "$NAMESPACE"
kubectl apply -f "$K8S_DIR/ingress.yaml" -n "$NAMESPACE"
log INFO "Service and Ingress applied"
deploy_timing_phase_end "Apply Service and Ingress"

deploy_timing_phase_start "Apply Deployment and update image"
phase "[5/7] Apply Deployment and update image"
kubectl apply -f "$K8S_DIR/deployment.yaml" -n "$NAMESPACE"
kubectl set image deployment/"$SERVICE_NAME" app="$IMAGE_LATEST" -n "$NAMESPACE"
log INFO "Deployment applied and image set to ${IMAGE}"
deploy_timing_phase_end "Apply Deployment and update image"

deploy_timing_phase_start "Wait for rollout"
phase "[6/7] Wait for rollout"
deploy_timing_k8s_rollout_wait kubectl "$SERVICE_NAME" "$NAMESPACE"
log INFO "Rollout finished successfully"
deploy_timing_phase_end "Wait for rollout"

deploy_timing_phase_start "Verify health and ExternalSecret"
phase "[7/7] Verify health and ExternalSecret readiness"
POD="$(kubectl get pod -n "$NAMESPACE" -l app="$SERVICE_NAME" -o jsonpath='{.items[0].metadata.name}')"
if [ -z "$POD" ]; then
  log ERROR "No pod found for ${SERVICE_NAME}"
  exit 1
fi

if ! kubectl exec -n "$NAMESPACE" "$POD" -- wget -qO- "http://localhost:4400/health" >/dev/null; then
  log ERROR "Health endpoint check failed inside pod"
  exit 1
fi
log INFO "Health endpoint check passed"

ES_READY="$(kubectl get externalsecret "${SERVICE_NAME}-secret" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || true)"
if [ "${ES_READY}" != "True" ]; then
  log ERROR "ExternalSecret ${SERVICE_NAME}-secret is not Ready (status=${ES_READY:-unknown})"
  kubectl describe externalsecret "${SERVICE_NAME}-secret" -n "$NAMESPACE" || true
  exit 1
fi
log INFO "ExternalSecret is Ready"
deploy_timing_phase_end "Verify health and ExternalSecret"

deploy_timing_finish_success "Leads Microservice"
echo -e "${GREEN}[$(ts)] Namespace: ${NAMESPACE}${NC}"
echo -e "${GREEN}[$(ts)] Image: ${IMAGE}${NC}"
DEPLOY_TIMING_FINISHED=1
exit 0
