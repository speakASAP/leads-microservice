import {
  LEAD_QUALIFICATION_RECORDED,
  CRITERIA_VERSION,
  buildQualificationEnvelope,
  parseQualificationRequest,
} from './qualification';

describe('parseQualificationRequest', () => {
  const valid = { qualificationStatus: 'qualified', reason: 'Odpověděl na WhatsApp, má telefon i e-mail.' };

  it('accepts a qualified judgement with a reason', () => {
    expect(parseQualificationRequest(valid)).toEqual({
      qualificationStatus: 'qualified',
      reason: 'Odpověděl na WhatsApp, má telefon i e-mail.',
    });
  });

  it('accepts a disqualified judgement', () => {
    const parsed = parseQualificationRequest({ qualificationStatus: 'disqualified', reason: 'Neodpověděl.' });
    expect(parsed?.qualificationStatus).toBe('disqualified');
  });

  it('carries supersedesQualificationId when correcting an earlier judgement', () => {
    const parsed = parseQualificationRequest({ ...valid, supersedesQualificationId: 'q-1' });
    expect(parsed?.supersedesQualificationId).toBe('q-1');
  });

  // `pending` is the absence of a judgement (C-006 §1.1). Accepting it here would let the CRM
  // record "I have not decided" as a decision, which is the one thing the status field must not
  // be able to say.
  it('rejects pending as a status', () => {
    expect(parseQualificationRequest({ qualificationStatus: 'pending', reason: 'zatím nevím' })).toBeUndefined();
  });

  it('rejects an unknown status', () => {
    expect(parseQualificationRequest({ qualificationStatus: 'maybe', reason: 'x' })).toBeUndefined();
  });

  // A defaulted reason looks complete and carries nothing.
  it('rejects a blank reason', () => {
    expect(parseQualificationRequest({ qualificationStatus: 'qualified', reason: '' })).toBeUndefined();
  });

  it('rejects a whitespace-only reason rather than trimming it into nothing', () => {
    expect(parseQualificationRequest({ qualificationStatus: 'qualified', reason: '   \n\t ' })).toBeUndefined();
  });

  it('rejects a missing reason', () => {
    expect(parseQualificationRequest({ qualificationStatus: 'qualified' })).toBeUndefined();
  });

  it('rejects a non-object', () => {
    expect(parseQualificationRequest(null)).toBeUndefined();
    expect(parseQualificationRequest('qualified')).toBeUndefined();
  });

  // The caller may not name itself the decider: decidedById comes from the auth guard, never the
  // request body (C-006 §1.3).
  it('ignores a caller-supplied decidedById', () => {
    const parsed = parseQualificationRequest({
      ...valid,
      decidedById: 'somebody-else',
    }) as unknown as Record<string, unknown>;
    expect(parsed).toBeDefined();
    expect(parsed.decidedById).toBeUndefined();
  });
});

describe('buildQualificationEnvelope', () => {
  const input = {
    qualificationId: 'q-abc',
    leadId: 'lead-1',
    qualificationStatus: 'qualified' as const,
    decidedById: 'admin-user-7',
    reason: 'Odpověděl na WhatsApp.',
    workspaceId: 'bazos',
    now: new Date('2026-07-22T10:00:00.000Z'),
    eventId: '11111111-2222-4333-8444-555555555555',
  };

  it('builds an envelope matching the contract', () => {
    expect(buildQualificationEnvelope(input)).toEqual({
      eventId: '11111111-2222-4333-8444-555555555555',
      eventType: LEAD_QUALIFICATION_RECORDED,
      eventVersion: 1,
      occurredAt: '2026-07-22T10:00:00.000Z',
      producer: 'leads-microservice',
      workspaceId: 'bazos',
      correlationId: 'lead-1',
      dataClass: 'personal',
      payload: {
        qualificationId: 'q-abc',
        leadId: 'lead-1',
        criteriaVersion: 'v1-owner-manual',
        qualificationStatus: 'qualified',
        decidedByType: 'human',
        decidedById: 'admin-user-7',
        decidedAt: '2026-07-22T10:00:00.000Z',
        reason: 'Odpověděl na WhatsApp.',
      },
    });
  });

  it('pins criteriaVersion and decidedByType so an automated decider needs a contract change', () => {
    const envelope = buildQualificationEnvelope(input);
    expect(envelope.payload.criteriaVersion).toBe(CRITERIA_VERSION);
    expect(envelope.payload.criteriaVersion).toBe('v1-owner-manual');
    expect(envelope.payload.decidedByType).toBe('human');
  });

  it('omits supersedesQualificationId rather than sending null when there is nothing to supersede', () => {
    const envelope = buildQualificationEnvelope(input);
    expect('supersedesQualificationId' in envelope.payload).toBe(false);
  });

  it('includes supersedesQualificationId when correcting', () => {
    const envelope = buildQualificationEnvelope({ ...input, supersedesQualificationId: 'q-old' });
    expect(envelope.payload.supersedesQualificationId).toBe('q-old');
  });

  // No email, phone or name. The event points at the lead; the lead holds the person.
  it('carries no contact details', () => {
    const serialised = JSON.stringify(buildQualificationEnvelope(input));
    expect(serialised).not.toMatch(/@/);
    expect(serialised).not.toMatch(/email|phone/i);
  });
});
