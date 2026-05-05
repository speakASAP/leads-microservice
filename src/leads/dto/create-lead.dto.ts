import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LeadContactMethodDto {
  @IsString()
  @IsNotEmpty()
  type: string;

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

  @IsOptional()
  @IsString()
  consentSource?: string;

  @IsOptional()
  @IsISO8601()
  consentCapturedAt?: string;
}
