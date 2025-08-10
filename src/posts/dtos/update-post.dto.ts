import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Tag } from '@prisma/client';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  content: string;
  @IsOptional()
  @IsEnum(Tag)
  tag: Tag;
}