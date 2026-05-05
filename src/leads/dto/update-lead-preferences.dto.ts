import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateLeadPreferencesDto {
  @IsOptional()
  @IsIn(['email', 'telegram', 'whatsapp', 'none'])
  preferredChannel?: 'email' | 'telegram' | 'whatsapp' | 'none' | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  fallbackChannels?: string[] | null;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean | null;

  @IsOptional()
  @IsString()
  consentSource?: string | null;

  @IsOptional()
  @IsISO8601()
  consentCapturedAt?: string | null;

  @IsOptional()
  @IsISO8601()
  unsubscribedAt?: string | null;
}
