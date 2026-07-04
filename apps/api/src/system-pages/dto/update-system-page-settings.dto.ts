import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSystemPageSettingsDto {
  // SEO
  @IsOptional()
  @IsString()
  @MaxLength(80)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  metaDesc?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;

  // Open Graph
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  ogDescription?: string;

  @IsOptional()
  @IsString()
  ogType?: string;

  @IsOptional()
  @IsString()
  ogUrl?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  // Favicon
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  // Free-form, pageType-specific settings — e.g. { productsPerPage } for
  // "product-listing". Validated loosely here; each page's UI is
  // responsible for the shape it writes.
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, unknown>;

  // Scripts
  @IsOptional()
  @IsString()
  headScript?: string;

  @IsOptional()
  @IsString()
  bodyScript?: string;

  // Styles
  @IsOptional()
  @IsString()
  customCss?: string;
}
