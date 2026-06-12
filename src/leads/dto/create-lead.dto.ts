import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LeadContactMethodDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['email', 'telegram', 'whatsapp'])
  type: 'email' | 'telegram' | 'whatsapp';

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  sourceService: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  sourceLabel?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => LeadContactMethodDto)
  contactMethods: LeadContactMethodDto[];

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['email', 'telegram', 'whatsapp', 'none'])
  preferredChannel?: 'email' | 'telegram' | 'whatsapp' | 'none';

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  fallbackChannels?: string[];

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @ValidateIf((payload, value) => payload.marketingConsent === true || value !== undefined)
  @IsString()
  @IsNotEmpty()
  consentSource?: string;

  @ValidateIf((payload, value) => payload.marketingConsent === true || value !== undefined)
  @IsISO8601()
  consentCapturedAt?: string;
}
