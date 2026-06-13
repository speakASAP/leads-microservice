# Goal 7 Validation Report - Frontend Cutover Deployment Path Check

Status: accepted
Date: 2026-06-13

## Scope

Owner-selected read-only follow-up: locate the frontend deployment path before cutover, or explicitly scope a destructive fixture-only merge/delete validation run.

## Pre-Coding Gate

Gate result: `pass-docs-only`. This was documentation and read-only operational discovery. No source, schema, API contract, consent semantics, lead data access, deployment, or production mutation was planned.

## DocsRAG Evidence

DocsRAG retrieval was run from inside the Leads runtime pod so the service token remained inside the cluster and was not printed. Retrieval returned HTTP 200. It included an older StateX integration note with blue/green compose commands, but current live Kubernetes manifests and cluster state supersede that note for cutover planning.

## Located Deployment Path

- Current frontend source path: `/home/ssf/Documents/Github/statex/statex-website/frontend`
- Current deploy script: `/home/ssf/Documents/Github/statex/scripts/deploy.sh`
- Build path: `/home/ssf/Documents/Github/statex/Dockerfile` copies `statex-website/frontend` into the runtime image.
- Live Kubernetes route: ingress `statex` in namespace `statex-apps` serves host `alfares.cz` to service `statex` port `3000`.
- Live deployment: deployment `statex` in namespace `statex-apps` uses image `localhost:5000/statex:latest` and had one ready pod during validation.

## Destructive Validation Decision

No destructive fixture-only merge/delete validation run was scoped or executed because the frontend deployment path was located. If such a run is requested later, it must be explicitly limited to synthetic fixture records in a non-production or isolated fixture namespace/database, with no production lead rows, contact values, raw messages, confirmation tokens, unsubscribe state, or secrets read, printed, merged, or deleted.

## Sensitive-Data Classification

`none`: validation used repository paths, public hostnames, Kubernetes resource names, and non-sensitive runtime metadata only. No secrets, contact details, raw lead rows, raw messages, confirmation tokens, private URLs, CRM records, or production payloads were captured.

## Consent Impact

No consent, confirmation, unsubscribe, or preference semantics changed.

## Contract Impact

No Leads API, schema, logging, notification, AI, CRM, frontend, or deployment contract changed.

## Validation Commands

- `rg -n "frontend|front-end|deployment path|deploy path|cutover|fixture|merge/delete|merge delete|delete validation|merge.*delete|destructive|fixture-only" .` in `leads-microservice`: no relevant frontend/cutover matches.
- `kubectl -n statex-apps get ingress statex -o wide`: passed; host `alfares.cz`.
- `kubectl -n statex-apps get svc statex -o wide`: passed; service port `3000/TCP`.
- `kubectl -n statex-apps get deploy statex -o wide`: passed; image `localhost:5000/statex:latest`, `1/1` ready.
- `kubectl -n statex-apps get pods -l app=statex -o wide`: passed; one running ready pod.
- Source inspection of `/home/ssf/Documents/Github/statex/Dockerfile`, `scripts/deploy.sh`, and `k8s/*.yaml`: passed; confirmed source and deploy path.

## Decision

Documentation-only readiness accepted. Deployment readiness was not evaluated because no deployment was requested.
