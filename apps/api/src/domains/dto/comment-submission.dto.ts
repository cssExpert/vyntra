import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const COMMENT_RESOURCE_TYPES = ['blog', 'page', 'product'] as const;
export type CommentResourceType = (typeof COMMENT_RESOURCE_TYPES)[number];

export class SubmitCommentDto {
  @IsIn(COMMENT_RESOURCE_TYPES)
  resourceType!: CommentResourceType;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  authorName!: string;

  @IsEmail()
  @MaxLength(254)
  authorEmail!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  body!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  captchaToken?: string;
}
