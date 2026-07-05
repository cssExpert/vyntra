import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export enum CustomerGroupRestrictionMode {
  ALL = 'all',
  ONLY_SELECTED = 'only_selected',
  EXCEPT_SELECTED = 'except_selected',
}

export class UpdateCustomerGroupRestrictionsDto {
  @IsOptional()
  @IsEnum(CustomerGroupRestrictionMode)
  categoriesMode?: CustomerGroupRestrictionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsEnum(CustomerGroupRestrictionMode)
  productsMode?: CustomerGroupRestrictionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @IsOptional()
  @IsString()
  productPattern?: string;

  @IsOptional()
  @IsEnum(CustomerGroupRestrictionMode)
  pagesMode?: CustomerGroupRestrictionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pageIds?: string[];

  @IsOptional()
  @IsEnum(CustomerGroupRestrictionMode)
  paymentMethodsMode?: CustomerGroupRestrictionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethodSlugs?: string[];

  @IsOptional()
  @IsEnum(CustomerGroupRestrictionMode)
  shippingMethodsMode?: CustomerGroupRestrictionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shippingMethodSlugs?: string[];

  @IsOptional()
  @IsEnum(CustomerGroupRestrictionMode)
  onlineGatewaysMode?: CustomerGroupRestrictionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  onlineGatewaySlugs?: string[];
}
