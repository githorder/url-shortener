import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message:
      'Alias can only contain letters, numbers, hyphens, and underscores',
  })
  alias?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
