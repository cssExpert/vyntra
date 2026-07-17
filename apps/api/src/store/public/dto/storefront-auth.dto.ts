import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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
