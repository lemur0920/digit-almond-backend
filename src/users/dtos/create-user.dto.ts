import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  password2: string;

  @IsString()
  lastName: string;

  @IsString()
  firstName: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsInt()
  point?: number;

  @IsOptional()
  @IsInt()
  cityCode?: number;

  // @IsOptional()
  // firstLoginAt?: Date;
}