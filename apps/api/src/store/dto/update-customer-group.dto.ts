import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { CustomerGroupDiscountType } from './create-customer-group.dto';

// Fields use `| null` alongside optionality to distinguish two update semantics:
// omitted (undefined) = leave the existing value untouched; explicit `null` = clear it.
export class UpdateCustomerGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

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
