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

phase "[1/7] Build image ${IMAGE}"
docker build -t "$IMAGE" -t "$IMAGE_LATEST" "$PROJECT_ROOT"
log INFO "Image build completed"

phase "[2/7] Push image to local registry"
docker push "$IMAGE"
docker push "$IMAGE_LATEST"
log INFO "Image push completed"

phase "[3/7] Apply ConfigMap and ExternalSecret (Vault-managed)"
kubectl apply -f "$K8S_DIR/configmap.yaml" -n "$NAMESPACE"
kubectl apply -f "$K8S_DIR/external-secret.yaml" -n "$NAMESPACE"
log INFO "ConfigMap and ExternalSecret applied"

phase "[4/7] Apply Service and Ingress"
kubectl apply -f "$K8S_DIR/service.yaml" -n "$NAMESPACE"
kubectl apply -f "$K8S_DIR/ingress.yaml" -n "$NAMESPACE"
log INFO "Service and Ingress applied"

phase "[5/7] Apply Deployment and update image"
kubectl apply -f "$K8S_DIR/deployment.yaml" -n "$NAMESPACE"
kubectl set image deployment/"$SERVICE_NAME" app="$IMAGE_LATEST" -n "$NAMESPACE"
log INFO "Deployment applied and image set to ${IMAGE}"

phase "[6/7] Wait for rollout"
if ! kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=120s; then
  log WARNING "Rollout did not complete in time. Diagnosing terminating pods..."
  kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME" -o wide || true
  TERMINATING_PODS=$(kubectl get pods -n "$NAMESPACE" -l app="$SERVICE_NAME" --no-headers 2>/dev/null | awk '$3=="Terminating"{print $1}')
  if [ -n "$TERMINATING_PODS" ]; then
    log WARNING "Force deleting stuck terminating pods..."
    for pod in $TERMINATING_PODS; do
      kubectl delete pod -n "$NAMESPACE" "$pod" --grace-period=0 --force || true
    done
  fi
  kubectl rollout status deployment/"$SERVICE_NAME" -n "$NAMESPACE" --timeout=120s
fi
log INFO "Rollout finished successfully"

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

echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}  ✅ Leads Microservice Deployment successful${NC}"
echo -e "${GREEN}==========================================================${NC}"
echo -e "${GREEN}[$(ts)] Namespace: ${NAMESPACE}${NC}"
echo -e "${GREEN}[$(ts)] Image: ${IMAGE}${NC}"
