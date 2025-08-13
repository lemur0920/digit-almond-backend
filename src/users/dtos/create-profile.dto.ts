import { IsOptional, IsString } from 'class-validator';
import { HasMimeType, IsFile } from 'nestjs-form-data';

export class CreateProfileDto {
  @IsString()
  nickname: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png'])
  @IsOptional()
  imgPath?: string;
}