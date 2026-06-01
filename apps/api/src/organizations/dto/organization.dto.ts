import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  /** Package slug to subscribe the new org to. */
  @IsString()
  packageSlug!: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;
}

export class AssignPackageDto {
  @IsString()
  packageSlug!: string;
}
