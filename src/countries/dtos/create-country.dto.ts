import { IsOptional, IsString } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  country: string;

  @IsString()
  koreanName: string;

  @IsString()
  @IsOptional()
  englishName?: string;
}