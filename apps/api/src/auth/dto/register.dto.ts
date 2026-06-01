import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Self-signup: creates a user, a new organization, and assigns the chosen
 * (public) package. The registering user becomes the ORG_ADMIN of that org.
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(2)
  organizationName!: string;

  /** Slug of a public package to subscribe to. Defaults to the free plan if omitted. */
  @IsOptional()
  @IsString()
  packageSlug?: string;
}
