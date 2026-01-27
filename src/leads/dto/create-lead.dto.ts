import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
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
}
