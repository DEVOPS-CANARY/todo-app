import { apiUrl } from "./api";

describe("apiUrl", () => {
  it("joins the base and the path with exactly one slash", () => {
    expect(apiUrl("/todos", "/api")).toBe("/api/todos");
    expect(apiUrl("todos", "/api/")).toBe("/api/todos");
    expect(apiUrl("/todos/1", "http://localhost:3001")).toBe("http://localhost:3001/todos/1");
  });

  it("defaults to the same-origin /api base", () => {
    expect(apiUrl("/health")).toBe("/api/health");
  });
});
