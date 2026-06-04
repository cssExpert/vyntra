import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateAdminSettingsDto {
  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  faviconUrl?: string | null;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxOrganizations?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsersPerOrganization?: number;

  @IsOptional()
  @IsBoolean()
  enableRegistration?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSocialAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
