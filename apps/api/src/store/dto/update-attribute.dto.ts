import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AttributeOptionDto } from './create-attribute.dto';

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  attributeType?: string;

  @IsOptional()
  @IsString()
  fieldType?: string;

  @IsOptional()
  @IsBoolean()
  usedInVariation?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeOptionDto)
  options?: AttributeOptionDto[];
}
