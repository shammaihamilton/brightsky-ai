import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  hebrew_name?: string;

  @IsOptional()
  @IsString()
  full_name_english?: string;

  @IsOptional()
  @IsString()
  embedding?: string;

  @IsOptional()
  count?: number;

  @IsOptional()
  @IsString()
  history?: string;
}
