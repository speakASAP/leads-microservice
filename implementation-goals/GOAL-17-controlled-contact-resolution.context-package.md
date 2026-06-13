# Goal 17 Context Package

## Source Context

- Goal 11 defined controlled contact resolution as a guarded internal API.
- Goal 16 added Marketing eligibility preview but intentionally did not return contact values.

## Sensitive Data

Contact values are raw lead data. They may be returned only by this guarded endpoint for one lead and requested channels. They must not be logged. Raw messages, confirmation tokens, source URLs, metadata values, campaign content, JWTs, and session tokens remain forbidden.
