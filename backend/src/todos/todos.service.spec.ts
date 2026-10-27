import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Todo } from "./todo.entity";
import { TodosService } from "./todos.service";

type RepoMock = {
  find: jest.Mock;
  findOneBy: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
};

function repoMock(): RepoMock {
  return {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn((todo: Partial<Todo>) => todo),
    save: jest.fn((todo: Partial<Todo>) => Promise.resolve({ id: "1", done: false, ...todo })),
    delete: jest.fn()
  };
}

describe("TodosService", () => {
  let repo: RepoMock;
  let service: TodosService;

  beforeEach(() => {
    repo = repoMock();
    service = new TodosService(repo as unknown as Repository<Todo>);
  });

  it("creates a todo with a trimmed title", async () => {
    const todo = await service.create({ title: "  write tests " });
    expect(todo.title).toBe("write tests");
    expect(todo.done).toBe(false);
  });

  it("marks a todo done", async () => {
    repo.findOneBy.mockResolvedValue({ id: "1", title: "ship", done: false });
    const todo = await service.update("1", { done: true });
    expect(todo.done).toBe(true);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: "1", done: true }));
  });

  it("throws NotFound for an unknown id", async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws NotFound when deleting an unknown id", async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
