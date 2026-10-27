import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UpdateTodoDto } from "./dto/update-todo.dto";
import { Todo } from "./todo.entity";

@Injectable()
export class TodosService {
  constructor(@InjectRepository(Todo) private readonly todos: Repository<Todo>) {}

  findAll(): Promise<Todo[]> {
    return this.todos.find({ order: { createdAt: "ASC" } });
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todos.findOneBy({ id });
    if (!todo) {
      throw new NotFoundException(`todo ${id} not found`);
    }
    return todo;
  }

  create(dto: CreateTodoDto): Promise<Todo> {
    return this.todos.save(this.todos.create({ title: dto.title.trim() }));
  }

  async update(id: string, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    if (dto.title !== undefined) {
      todo.title = dto.title.trim();
    }
    if (dto.done !== undefined) {
      todo.done = dto.done;
    }
    return this.todos.save(todo);
  }

  async remove(id: string): Promise<void> {
    const result = await this.todos.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`todo ${id} not found`);
    }
  }
}
