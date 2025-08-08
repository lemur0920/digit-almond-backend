import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
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

  @IsString()
  countryCode: string;

  // @IsOptional()
  // firstLoginAt?: Date;
}