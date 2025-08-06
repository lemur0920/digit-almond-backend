import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Priority } from '@prisma/client';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => {
    const priorityMap = {
      Low: Priority.LOW,
      Middle: Priority.MIDDLE,
      High: Priority.HIGH,
    };
    return priorityMap[value];
  })

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean = false; // 기본 값 false
}