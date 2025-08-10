import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Tag } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(Tag)
  @IsOptional()
  tag: Tag;
}