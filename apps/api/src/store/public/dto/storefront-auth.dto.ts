import { IsEmail, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterAddressDto {
  @IsOptional()
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zip?: string;
}

export class StorefrontRegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  customerGroupId?: string;

  /** When provided (from the full signup page), saved as the customer's default shipping + billing address. */
  @IsOptional()
  @IsObject()
  address?: RegisterAddressDto;
}

export class StorefrontLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class StorefrontRefreshDto {
  @IsString()
  refreshToken: string;
}

export class ChangeCustomerPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  /** The frontend's own /account/reset-password URL (e.g. `${window.location.origin}/account/reset-password`) — the backend can't reliably guess the tenant's current domain (localhost vs. subdomain vs. custom domain), so the client supplies it and the server just appends ?token=. */
  @IsOptional()
  @IsString()
  resetUrlBase?: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
