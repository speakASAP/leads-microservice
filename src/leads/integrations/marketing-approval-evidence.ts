export const MARKETING_APPROVAL_PURPOSE_CODES = [
  'product_nurture',
  'newsletter_opt_in',
  'event_follow_up',
  'lifecycle_follow_up',
  'customer_reactivation',
] as const;

export const MARKETING_APPROVAL_RETENTION_EXPECTATIONS = [
  'marketing_retains_until_campaign_audit_window_expires',
  'marketing_retains_until_consent_review_supersedes',
] as const;

export type MarketingApprovalPurposeCode = (typeof MARKETING_APPROVAL_PURPOSE_CODES)[number];
export type MarketingApprovalRetentionExpectation = (typeof MARKETING_APPROVAL_RETENTION_EXPECTATIONS)[number];
export type MarketingApprovalChannel = 'email' | 'telegram' | 'whatsapp';

export interface MarketingApprovalEvidenceInput {
  approvalId?: string;
  campaignId?: string;
  approvedBy?: string;
  approvedAt?: string;
  workspaceId?: string;
  purposeCode?: MarketingApprovalPurposeCode;
  channel?: MarketingApprovalChannel;
  audienceCount?: number;
  eligibleCount?: number;
  contentVersion?: string;
  retentionExpectation?: MarketingApprovalRetentionExpectation;
}

export interface MarketingApprovalEvidenceSummary {
  approvalId: string;
  campaignId: string;
  approvedAt: string;
  purposeCode: MarketingApprovalPurposeCode;
  channel: MarketingApprovalChannel;
  audienceCount: number;
  eligibleCount: number;
  retentionExpectation: MarketingApprovalRetentionExpectation;
  humanApprovalReferencePresent: boolean;
  approvedByPresent: boolean;
  workspaceIdPresent: boolean;
  contentVersionPresent: boolean;
}

export interface MarketingApprovalEvidenceStorageRecord {
  leadId: string;
  idempotencyKey: string;
  approvalId: string;
  campaignId: string;
  approvedAt: Date;
  purposeCode: MarketingApprovalPurposeCode;
  channel: MarketingApprovalChannel;
  audienceCount: number;
  eligibleCount: number;
  retentionExpectation: MarketingApprovalRetentionExpectation;
  humanApprovalReferencePresent: boolean;
  approvedByPresent: boolean;
  workspaceIdPresent: boolean;
  contentVersionPresent: boolean;
  eligibilityEligible: boolean;
  eligibilityReasons: string[];
  returnedContactMethodCount: number;
}

const REQUIRED_FIELDS: Array<keyof MarketingApprovalEvidenceInput> = [
  'approvalId',
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
];

export function missingMarketingApprovalEvidenceFields(evidence?: MarketingApprovalEvidenceInput | null): string[] {
  if (!evidence) {
    return ['approvalEvidence'];
  }

  return REQUIRED_FIELDS.filter((field) => {
    const value = evidence[field];
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    return value === undefined || value === null;
  });
}

export function validateMarketingApprovalEvidenceForContactResolution(
  evidence: MarketingApprovalEvidenceInput | undefined,
  requestedChannels: string[],
) {
  const reasons: string[] = [];
  const missingFields = missingMarketingApprovalEvidenceFields(evidence);
  if (missingFields.length > 0) {
    reasons.push(`missing_approval_evidence:${missingFields.join(',')}`);
  }
  if (requestedChannels.length !== 1) {
    reasons.push('single_campaign_channel_required');
  }
  if (evidence?.channel && requestedChannels.length === 1 && evidence.channel !== requestedChannels[0]) {
    reasons.push('approval_channel_mismatch');
  }
  if (evidence?.channel && !['email', 'telegram', 'whatsapp'].includes(evidence.channel)) {
    reasons.push('invalid_approval_channel');
  }
  if (evidence?.purposeCode && !MARKETING_APPROVAL_PURPOSE_CODES.includes(evidence.purposeCode)) {
    reasons.push('invalid_purpose_code');
  }
  if (
    evidence?.retentionExpectation &&
    !MARKETING_APPROVAL_RETENTION_EXPECTATIONS.includes(evidence.retentionExpectation)
  ) {
    reasons.push('invalid_retention_expectation');
  }
  if (evidence?.approvedAt && Number.isNaN(Date.parse(evidence.approvedAt))) {
    reasons.push('invalid_approved_at');
  }
  if (
    evidence?.audienceCount !== undefined &&
    (!Number.isInteger(evidence.audienceCount) || evidence.audienceCount < 0)
  ) {
    reasons.push('invalid_audience_count');
  }
  if (
    evidence?.eligibleCount !== undefined &&
    (!Number.isInteger(evidence.eligibleCount) || evidence.eligibleCount < 0)
  ) {
    reasons.push('invalid_eligible_count');
  }
  if (
    Number.isInteger(evidence?.audienceCount) &&
    Number.isInteger(evidence?.eligibleCount) &&
    (evidence?.eligibleCount ?? 0) > (evidence?.audienceCount ?? 0)
  ) {
    reasons.push('eligible_count_exceeds_audience_count');
  }
  return reasons;
}

export function buildMarketingApprovalEvidenceSummary(
  evidence: MarketingApprovalEvidenceInput,
): MarketingApprovalEvidenceSummary {
  return {
    approvalId: evidence.approvalId ?? '',
    campaignId: evidence.campaignId ?? '',
    approvedAt: evidence.approvedAt ?? '',
    purposeCode: evidence.purposeCode as MarketingApprovalPurposeCode,
    channel: evidence.channel as MarketingApprovalChannel,
    audienceCount: evidence.audienceCount ?? 0,
    eligibleCount: evidence.eligibleCount ?? 0,
    retentionExpectation: evidence.retentionExpectation as MarketingApprovalRetentionExpectation,
    humanApprovalReferencePresent: Boolean(evidence.approvalId && evidence.campaignId && evidence.approvedAt),
    approvedByPresent: Boolean(evidence.approvedBy),
    workspaceIdPresent: Boolean(evidence.workspaceId),
    contentVersionPresent: Boolean(evidence.contentVersion),
  };
}

export function buildMarketingApprovalEvidenceStorageRecord(
  leadId: string,
  evidence: MarketingApprovalEvidenceInput,
  eligibility: { eligible: boolean; reasons?: string[] },
  returnedContactMethodCount: number,
): MarketingApprovalEvidenceStorageRecord {
  const summary = buildMarketingApprovalEvidenceSummary(evidence);
  return {
    leadId,
    idempotencyKey: [
      'marketing-approval-evidence',
      leadId,
      summary.approvalId,
      summary.campaignId,
      summary.channel,
      summary.approvedAt,
    ].join(':'),
    approvalId: summary.approvalId,
    campaignId: summary.campaignId,
    approvedAt: new Date(summary.approvedAt),
    purposeCode: summary.purposeCode,
    channel: summary.channel,
    audienceCount: summary.audienceCount,
    eligibleCount: summary.eligibleCount,
    retentionExpectation: summary.retentionExpectation,
    humanApprovalReferencePresent: summary.humanApprovalReferencePresent,
    approvedByPresent: summary.approvedByPresent,
    workspaceIdPresent: summary.workspaceIdPresent,
    contentVersionPresent: summary.contentVersionPresent,
    eligibilityEligible: eligibility.eligible,
    eligibilityReasons: eligibility.reasons ?? [],
    returnedContactMethodCount,
  };
}
