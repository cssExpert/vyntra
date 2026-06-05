import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SetSubdomainDto {
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
    message:
      'Subdomain must be 3–63 lowercase alphanumeric characters or hyphens, not starting or ending with a hyphen',
  })
  subdomain!: string;
}

export class SetCustomDomainDto {
  @IsString()
  @MaxLength(253)
  @Matches(/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/, {
    message: 'Invalid domain format — expected something like example.com',
  })
  customDomain!: string;
}
