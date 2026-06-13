# Goal 15 Context Package

## Current State

- Goal 12 added minimized lifecycle event builders.
- Goal 13 adopted `LeadSubmitted`.
- Goal 14 adopted `LeadConfirmed` and `LeadPreferenceUpdated`.
- Lifecycle events are currently recorded directly from the controller through `LoggingService`.

## Selected Slices

1. Consumer-side routing metadata: centralize event recording and make intended internal consumers explicit without adding a message bus.
2. Auth conversion linkage: add a guarded endpoint for trusted Auth/service callers to record minimized `LeadConvertedToUser` linkage evidence.

## Sensitive Data

Sensitive: raw contact values, raw messages, confirmation tokens, source URL path/query, metadata values, JWT/session/token values, and raw consent source values.

Allowed minimized metadata: lead ID, source service, lifecycle timestamps, consumer route names, Auth user ID, link method, and idempotency keys.
