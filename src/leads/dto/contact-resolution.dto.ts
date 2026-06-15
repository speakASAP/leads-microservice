import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  MARKETING_APPROVAL_PURPOSE_CODES,
  MARKETING_APPROVAL_RETENTION_EXPECTATIONS,
  MarketingApprovalChannel,
  MarketingApprovalPurposeCode,
  MarketingApprovalRetentionExpectation,
} from '../integrations/marketing-approval-evidence';

export class MarketingApprovalEvidenceDto {
  @IsString()
  approvalId!: string;

  @IsString()
  campaignId!: string;

  @IsString()
  approvedBy!: string;

  @IsISO8601()
  approvedAt!: string;

  @IsString()
  workspaceId!: string;

  @IsIn(MARKETING_APPROVAL_PURPOSE_CODES)
  purposeCode!: MarketingApprovalPurposeCode;

  @IsIn(['email', 'telegram', 'whatsapp'])
  channel!: MarketingApprovalChannel;

  @IsInt()
  @Min(0)
  audienceCount!: number;

  @IsInt()
  @Min(0)
  eligibleCount!: number;

  @IsString()
  contentVersion!: string;

  @IsIn(MARKETING_APPROVAL_RETENTION_EXPECTATIONS)
  retentionExpectation!: MarketingApprovalRetentionExpectation;
}

export class ContactResolutionDto {
  @IsString()
  leadId!: string;

  @IsIn(['single_lead_human_review', 'approved_campaign_send', 'auth_conversion_link'])
  purpose!: 'single_lead_human_review' | 'approved_campaign_send' | 'auth_conversion_link';

  @ValidateIf((payload) => payload.purpose === 'approved_campaign_send')
  @ValidateNested()
  @Type(() => MarketingApprovalEvidenceDto)
  approvalEvidence?: MarketingApprovalEvidenceDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsIn(['email', 'telegram', 'whatsapp'], { each: true })
  requestedChannels?: Array<'email' | 'telegram' | 'whatsapp'>;

  @IsOptional()
  @IsIn(['marketing', 'transactional', 'lifecycle'])
  campaignPurpose?: 'marketing' | 'transactional' | 'lifecycle';

  @IsOptional()
  @IsBoolean()
  requireConfirmedContact?: boolean;
}
