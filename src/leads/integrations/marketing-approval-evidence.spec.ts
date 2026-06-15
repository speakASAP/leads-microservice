import {
  buildMarketingApprovalEvidenceSummary,
  missingMarketingApprovalEvidenceFields,
  validateMarketingApprovalEvidenceForContactResolution,
} from './marketing-approval-evidence';

const approvalEvidence = {
  approvalId: 'approval_synthetic_25',
  campaignId: 'campaign_synthetic_25',
  approvedBy: 'auth_user_synthetic_reviewer',
  approvedAt: '2026-06-13T20:00:00.000Z',
  workspaceId: 'workspace_synthetic_25',
  purposeCode: 'product_nurture' as const,
  channel: 'email' as const,
  audienceCount: 12,
  eligibleCount: 10,
  contentVersion: 'content_version_synthetic_25',
  retentionExpectation: 'marketing_retains_until_campaign_audit_window_expires' as const,
};

describe('marketing approval evidence handoff', () => {
  it('builds an audit-safe approval summary without campaign content or contact values', () => {
    const summary = buildMarketingApprovalEvidenceSummary({
      ...approvalEvidence,
      campaignContent: 'Synthetic campaign body must stay Marketing-owned.',
      recipientContact: 'person@example.test',
      rawConsentSource: 'private-consent-source:v1',
    } as never);

    expect(summary).toEqual({
      approvalId: 'approval_synthetic_25',
      campaignId: 'campaign_synthetic_25',
      approvedAt: '2026-06-13T20:00:00.000Z',
      purposeCode: 'product_nurture',
      channel: 'email',
      audienceCount: 12,
      eligibleCount: 10,
      retentionExpectation: 'marketing_retains_until_campaign_audit_window_expires',
      humanApprovalReferencePresent: true,
      approvedByPresent: true,
      workspaceIdPresent: true,
      contentVersionPresent: true,
    });

    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain('Synthetic campaign body');
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('private-consent-source:v1');
    expect(serialized).not.toContain('content_version_synthetic_25');
    expect(serialized).not.toContain('auth_user_synthetic_reviewer');
  });

  it('requires all approval evidence fields before contact resolution', () => {
    expect(missingMarketingApprovalEvidenceFields()).toEqual(['approvalEvidence']);
    expect(missingMarketingApprovalEvidenceFields({ approvalId: 'approval_synthetic_25' })).toEqual([
      'campaignId',
      'approvedBy',
      'approvedAt',
      'workspaceId',
      'purposeCode',
      'channel',
      'audienceCount',
      'eligibleCount',
      'contentVersion',
      'retentionExpectation',
    ]);
  });

  it('rejects ambiguous or mismatched campaign contact resolution channels', () => {
    expect(validateMarketingApprovalEvidenceForContactResolution(approvalEvidence, ['email'])).toEqual([]);
    expect(validateMarketingApprovalEvidenceForContactResolution(approvalEvidence, ['email', 'telegram'])).toEqual([
      'single_campaign_channel_required',
    ]);
    expect(validateMarketingApprovalEvidenceForContactResolution(approvalEvidence, ['telegram'])).toEqual([
      'approval_channel_mismatch',
    ]);
  });
});
