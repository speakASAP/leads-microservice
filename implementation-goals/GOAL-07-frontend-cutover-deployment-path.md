# Goal 7 - Frontend Cutover Deployment Path Check

Status: done
Owner request: locate the frontend deployment path before cutover, or explicitly scope a destructive fixture-only merge/delete validation run.

## Decision

Frontend deployment path was located. The destructive fixture-only merge/delete validation branch was not selected, scoped, or run.

## Located Path

- Source repository: `/home/ssf/Documents/Github/statex`
- Frontend source path: `/home/ssf/Documents/Github/statex/statex-website/frontend`
- Production deploy command path: `/home/ssf/Documents/Github/statex/scripts/deploy.sh`
- Production Kubernetes deployment: `statex` in namespace `statex-apps`
- Production host: `https://alfares.cz`
- Runtime image: `localhost:5000/statex:latest`

## Evidence

Read-only validation confirmed ingress `statex` routes `alfares.cz` to service `statex` on port `3000`, deployment `statex` was `1/1` ready, and the StateX root Dockerfile builds the Kubernetes image by copying `statex-website/frontend` into `/app`.

## Non-Goals

- No Leads runtime source change.
- No frontend source change.
- No deployment, cutover, merge, delete, or production mutation.
- No raw lead retrieval or fixture data manipulation.
