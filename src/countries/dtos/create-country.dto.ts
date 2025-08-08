import { IsOptional, IsString } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  countryCode: string;

  @IsString()
  koreanName: string;

  @IsString()
  @IsOptional()
  englishName?: string;
}