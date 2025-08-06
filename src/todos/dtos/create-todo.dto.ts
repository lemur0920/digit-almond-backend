import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Priority } from '@prisma/client';
import { Transform } from 'class-transformer';


export class CreateTodoDto {
  @IsString()
  title: string;

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
  @IsEnum(Priority)
  priority: Priority;

  @IsBoolean()
  isDone: boolean = false; // 기본 값 false
}