import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';

export enum CustomerGroupDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CreateCustomerGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(CustomerGroupDiscountType)
  discountType?: CustomerGroupDiscountType | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number | null;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOrderValue?: number | null;
}
