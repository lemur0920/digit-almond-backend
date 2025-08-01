import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  dnScore: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}
