# Goal 16 Context Package

## Source Context

- Goal 11 marketing eligibility contract defines affirmative marketing consent, consent source, consent captured timestamp, no unsubscribe state, channel support, and optional confirmation as eligibility evidence.
- Goal 15 added lifecycle event routing and Auth conversion linkage; no Marketing eligibility runtime exists yet.

## Sensitive Data Classification

Sensitive and forbidden in response/logging: raw contact values, raw messages, confirmation tokens, full source URLs, private path/query values, metadata values, campaign content, JWT/session tokens, and arbitrary lead payloads.

Allowed minimized values: lead IDs, eligibility booleans, deterministic reason codes, contact method types, preferred channel, fallback channel count, consent evidence booleans, confirmation/unsubscribe booleans, and aggregate counts.
