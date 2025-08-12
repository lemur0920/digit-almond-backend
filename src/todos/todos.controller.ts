import { Body, Controller, Patch, Post, Req, Param, Get, Delete } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { ResponseDto } from '../common/response.dto';
import { Todo } from '@prisma/client';
import { UpdateTodoDto } from './dtos/update-todo.dt';
import { CreateProfileDto } from '../users/dtos/create-profile.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async createTodo(
    @Req() req: any,
    @Body() createTodoDto: CreateTodoDto
  ): Promise<ResponseDto<Todo>> {
    const newTodo = this.todosService.createTodo(req.user.userId, createTodoDto);

    return ResponseDto.success({
      message: '투두 생성 성공',
      data: await newTodo
    })
  }

  @Get()
  async getTodos(): Promise<ResponseDto<Todo[]>> {
    const todos = await this.todosService.getTodos();
    return ResponseDto.success({
      message: '투두 리스트 조회 성공',
      data: todos
    })
  }
  @Patch(':id')
  async updateTodo(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<ResponseDto<Todo>> {
    const updatedTodo = await this.todosService.updateTodo(id, updateTodoDto);
    return ResponseDto.success({
      message: '투두 수정 성공',
      data: updatedTodo
    })
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string): Promise<ResponseDto<void>> {
    await this.todosService.deleteTodo(id);
    return ResponseDto.success({
      message: '투두 삭제 성공',
    })
  }
}
