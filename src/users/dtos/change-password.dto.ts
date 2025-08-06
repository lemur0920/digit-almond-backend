import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  // 기존 비밀번호 인증
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password1: string;


  // 새 비밀번호
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password2: string;
}