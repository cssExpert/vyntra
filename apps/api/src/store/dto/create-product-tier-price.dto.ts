import { IsString, IsOptional, IsInt, IsNumber, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductTierPriceRowDto {
  @IsOptional()
  @IsString()
  customerGroupId?: string | null;

  @IsInt()
  @Min(1)
  minQty: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateProductTierPricesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTierPriceRowDto)
  rows: ProductTierPriceRowDto[];
}
