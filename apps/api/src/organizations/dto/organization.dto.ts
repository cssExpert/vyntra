import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

/**
 * Super-admin "Add Company" payload. Captures the company profile, its starting
 * package, and the credentials for the company's first administrator — all
 * created together in a single transaction (see OrganizationsService.create).
 */
export class CreateOrganizationDto {
  // ── Company profile ──
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /** Package slug to subscribe the new company to. */
  @IsString()
  packageSlug!: string;

  // ── First administrator (provisioned with the company) ──
  @IsString()
  @MinLength(1)
  adminFirstName!: string;

  @IsOptional()
  @IsString()
  adminLastName?: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(8)
  adminPassword!: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

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

  /** Optionally switch the company's package in the same edit. */
  @IsOptional()
  @IsString()
  packageSlug?: string;
}

export class AssignPackageDto {
  @IsString()
  packageSlug!: string;
}

export class OrganizationSettingsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  darkLogoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @IsOptional()
  @IsBoolean()
  themeSwitcherEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  blogCommentsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  blogFeaturedEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  blogPinToTopEnabled?: boolean;

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
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  slackNotifications?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  siteLanguages?: string[];

  @IsOptional()
  @IsString()
  defaultSiteLanguage?: string;
}
