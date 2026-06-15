# Goal 26 - Product-App Intake Compatibility Matrix

Status: complete for Leads-side synthetic matrix; cross-repo app edits remain blocked.

Intent: Prove approved product-app intake payloads remain compatible with Leads public validation and source taxonomy without editing product apps or submitting production intake payloads.

## Scope

Allowed:
- Product source taxonomy docs/tests and synthetic fixtures in Leads.
- Goal 26 artifacts under implementation-goals.
- Append-only status evidence after validation.

Forbidden:
- Editing StateX, Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, or other product app repositories.
- Production lead creation or production intake mutation validation.
- Raw contact export, campaign execution, AI/CRM export, schema change, deployment, or secret/config changes.

## Synthetic Matrix

Approved source services under test:

| sourceService | Status |
| --- | --- |
| shop-assistant | covered by synthetic matrix |
| buzzos | covered by synthetic matrix |
| flipflop | covered by synthetic matrix |
| speakup | covered by synthetic matrix |
| marathon | covered by synthetic matrix |
| statex | covered by synthetic matrix |
| sgiprealestate | covered by synthetic matrix |
| leads-landing | covered by synthetic matrix |
| shared-landing | covered by synthetic matrix |

Supported contact method types under test: email, telegram, whatsapp.

Expected fixture count: 27 payloads, one for every approved source service and contact method type pair.

## Compatibility Risks And Follow-Ups

- Product apps must not invent sourceService values; new values need Leads taxonomy documentation before production use.
- Product apps sending marketingConsent true must include non-empty consentSource and valid ISO consentCapturedAt.
- Product apps must keep metadata on approved keys and must not duplicate raw contact values or sensitive private context in metadata.
- Cross-repo app adoption remains blocked until the owner selects target apps and repositories.
- Production mutation validation remains blocked until the owner approves exact synthetic payloads.

## Completion Evidence

- npm test -- --runTestsByPath src/leads/integrations/product-app-intake-matrix.spec.ts src/leads/integrations/product-app-intake.spec.ts: passed, 2 suites, 8 tests.
- npm run build: passed.
- Missing-marker scan: passed with no matches.
- Secret-pattern scan: passed with no matches.
- No production intake submission, product-app repository edit, deployment, raw export, campaign execution, or AI/CRM export was performed.
