import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsISO8601 } from 'class-validator';

export class CreateCouponCodeDto {
  @IsString()
  code: string;

  @IsString()
  type: string; // percentage, fixed, free_shipping

  @IsNumber()
  value: number;

  @IsOptional()
  @IsNumber()
  minimumSpend?: number;

  @IsOptional()
  @IsNumber()
  maximumDiscount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  usageLimitPerUser?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;
}
