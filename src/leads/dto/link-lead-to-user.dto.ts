import { IsIn, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class LinkLeadToUserDto {
  @IsString()
  @MaxLength(128)
  userId!: string;

  @IsIn(['verified_contact', 'conversion_token', 'owner_reviewed_manual_link'])
  linkMethod!: 'verified_contact' | 'conversion_token' | 'owner_reviewed_manual_link';

  @IsOptional()
  @IsISO8601()
  linkedAt?: string;
}
