import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from "@nestjs/common";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { Todo } from "./todo.entity";
import { TodosService } from "./todos.service";

// Reached as /api/todos through the gateway (the /api prefix is stripped).
@Controller("todos")
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  findAll(): Promise<Todo[]> {
    return this.todos.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Todo> {
    return this.todos.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTodoDto): Promise<Todo> {
    return this.todos.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTodoDto): Promise<Todo> {
    return this.todos.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.todos.remove(id);
  }
}
