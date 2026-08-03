import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateStripeConfigDto {
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  stripeTestMode?: boolean;

  @IsOptional()
  @IsString()
  stripePublishableKey?: string;

  /** Only sent when rotating the secret — omitted/blank means "keep the existing one". */
  @IsOptional()
  @IsString()
  stripeSecretKey?: string;

  /** Only sent when rotating the webhook signing secret — omitted/blank means "keep the existing one". */
  @IsOptional()
  @IsString()
  stripeWebhookSecret?: string;
}
