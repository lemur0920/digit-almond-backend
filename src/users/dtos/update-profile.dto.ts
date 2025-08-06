import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
//TODO: 길이 제한 추가
  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imgUrl: string;
}

