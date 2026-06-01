import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @MinLength(2)
  key!: string; // e.g. "CMS"

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
