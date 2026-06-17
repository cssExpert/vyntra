import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  warehouseLocation?: string;
}
