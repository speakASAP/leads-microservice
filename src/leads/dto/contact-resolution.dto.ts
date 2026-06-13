import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ContactResolutionDto {
  @IsString()
  leadId!: string;

  @IsIn(['single_lead_human_review', 'approved_campaign_send', 'auth_conversion_link'])
  purpose!: 'single_lead_human_review' | 'approved_campaign_send' | 'auth_conversion_link';

  @ValidateIf((payload) => payload.purpose === 'approved_campaign_send')
  @IsString()
  approvalId?: string;

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
  requireConfirmedContact?: boolean;
}
