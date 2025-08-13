import { IsOptional, IsString } from 'class-validator';
import { FileSystemStoredFile, HasMimeType, IsFile } from 'nestjs-form-data';

export class CreateProfileDto {
  @IsString()
  nickname: string;

  @IsString()
  @IsOptional()
  description?: string;
}