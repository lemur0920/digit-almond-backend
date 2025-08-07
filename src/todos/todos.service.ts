import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Todo } from '@prisma/client';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dt';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodos() {
    return this.prisma.todo.findMany();
  }
  async createTodo(userId: string, createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        ...createTodoDto,
        user: {
          connect: { id:userId },
        }
      }
    })
  }

  async updateTodo(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.prisma.todo.findUnique({
      where: { id: id }
    })
    if (!todo) {
      throw new CustomException(EXCEPTION_STATUS.TODO.NOT_FOUND);
    }
    console.log(updateTodoDto)
    return this.prisma.todo.update({
      where: { id: id },
      data: { ...updateTodoDto }
    })
  }
  async deleteTodo(id: string): Promise<void> {
    if (!id) {
      throw new CustomException(EXCEPTION_STATUS.TODO.NOT_FOUND);
    }
    this.prisma.todo.delete({
      where: { id: id }
    })
  }
}
