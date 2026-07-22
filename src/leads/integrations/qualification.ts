/**
 * S6 — the owner's manual judgement about a lead (C-006 §1, D19 §4.4.1).
 *
 * Pure on purpose, like `registration-lead.ts`: what a judgement is allowed to say, and what the
 * emitted event looks like, decided without a database or a broker in reach. The rules worth
 * testing cheaply here are the negative ones — that `pending` is not a status, that a blank
 * reason is a rejection rather than a default, and that the caller cannot name itself the decider.
 */

export const LEAD_QUALIFICATION_RECORDED = 'growth.lead.qualification_recorded.v1';

/**
 * Complete contact (phone AND email) + a detailed request + the person replied on some channel.
 *
 * A constant rather than a parameter. The criteria are part of what the judgement *means*, so a
 * revision of them is a new event version — otherwise a judgement recorded under one definition
 * gets silently re-read under another, and the historical numbers change without anything
 * appearing to have changed.
 */
export const CRITERIA_VERSION = 'v1-owner-manual';

export type QualificationStatus = 'qualified' | 'disqualified';

/**
 * `pending` is deliberately not here. It is the absence of a judgement, not a judgement — see
 * C-006 §1.1. It is also load-bearing for the cost metric: pending leads stay in the numerator of
 * cost-per-qualified, and a derived `pending` cannot drift from that rule because there is nothing
 * to set.
 */
const STATUSES: readonly string[] = ['qualified', 'disqualified'];

export interface ParsedQualificationRequest {
  qualificationStatus: QualificationStatus;
  reason: string;
  supersedesQualificationId?: string;
}

/**
 * Reads a qualification request off the wire, or returns nothing.
 *
 * Never throws: this is request-shaped input from a browser, and the controller turns `undefined`
 * into a 400.
 */
export function parseQualificationRequest(candidate: unknown): ParsedQualificationRequest | undefined {
  if (typeof candidate !== 'object' || candidate === null) return undefined;

  const body = candidate as Record<string, unknown>;

  const qualificationStatus = str(body.qualificationStatus);
  if (!qualificationStatus || !STATUSES.includes(qualificationStatus)) return undefined;

  // Blank is rejected, never defaulted. A judgement with an empty reason reads as complete in
  // every list and carries nothing when someone later asks why the lead was written off.
  const reason = str(body.reason);
  if (!reason) return undefined;

  const parsed: ParsedQualificationRequest = {
    qualificationStatus: qualificationStatus as QualificationStatus,
    reason,
  };

  const supersedes = str(body.supersedesQualificationId);
  if (supersedes) parsed.supersedesQualificationId = supersedes;

  // `decidedById` is NOT read from the body, on purpose and by omission. It comes from the
  // authenticated principal on the request. A body-supplied decider would let whoever can reach
  // the endpoint attribute a judgement to somebody else, which is the one field an audit of these
  // decisions rests on.
  return parsed;
}

export interface QualificationEnvelopeInput {
  qualificationId: string;
  leadId: string;
  qualificationStatus: QualificationStatus;
  decidedById: string;
  reason: string;
  workspaceId: string;
  now: Date;
  eventId: string;
  supersedesQualificationId?: string;
}

export function buildQualificationEnvelope(input: QualificationEnvelopeInput) {
  const decidedAt = input.now.toISOString();

  const payload: {
    qualificationId: string;
    leadId: string;
    criteriaVersion: string;
    qualificationStatus: QualificationStatus;
    decidedByType: 'human';
    decidedById: string;
    decidedAt: string;
    reason: string;
    supersedesQualificationId?: string;
  } = {
    qualificationId: input.qualificationId,
    leadId: input.leadId,
    criteriaVersion: CRITERIA_VERSION,
    qualificationStatus: input.qualificationStatus,
    // Always human at v1. No rule-based and no AI qualification exists, and pinning it here plus
    // as a `const` in the schema is what makes adding one require a contract change rather than a
    // quiet code change.
    decidedByType: 'human',
    decidedById: input.decidedById,
    decidedAt,
    reason: input.reason,
  };

  // Absent rather than null: the contract schema sets additionalProperties false and does not
  // permit null here, so a null would be rejected by growth-core — which surfaces as a judgement
  // that silently never arrives rather than as an error.
  if (input.supersedesQualificationId) {
    payload.supersedesQualificationId = input.supersedesQualificationId;
  }

  return {
    eventId: input.eventId,
    eventType: LEAD_QUALIFICATION_RECORDED,
    eventVersion: 1 as const,
    occurredAt: decidedAt,
    producer: 'leads-microservice' as const,
    workspaceId: input.workspaceId,
    // The lead is the thing this event is about and the handle growth-core joins on. The lead's
    // own correlationId is not reachable here without a second read, and growth-core already
    // holds it against the lead row.
    correlationId: input.leadId,
    dataClass: 'personal' as const,
    // No email, phone or name. The event points at the lead; the lead holds the person. Copying
    // contact details in would duplicate them into every queue, log and consumer downstream, and
    // an erasure request would then have to chase them.
    payload,
  };
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
