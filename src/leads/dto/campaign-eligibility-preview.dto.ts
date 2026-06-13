import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CampaignEligibilityPreviewDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  leadIds!: string[];

  @IsIn(['marketing', 'transactional', 'lifecycle'])
  campaignPurpose!: 'marketing' | 'transactional' | 'lifecycle';

  @IsIn(['email', 'telegram', 'whatsapp'])
  channel!: 'email' | 'telegram' | 'whatsapp';

  @IsOptional()
  @IsBoolean()
  requireConfirmedContact?: boolean;
}
