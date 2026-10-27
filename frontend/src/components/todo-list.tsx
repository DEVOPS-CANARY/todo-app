"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Todo, todosApi } from "@/lib/api";

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setTodos(await todosApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load todos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    setTitle("");
    void run(() => todosApi.create(trimmed));
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          maxLength={200}
          aria-label="New todo"
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="empty">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="empty">Nothing to do.</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : undefined}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => void run(() => todosApi.update(todo.id, { done: !todo.done }))}
                aria-label={`Mark ${todo.title} ${todo.done ? "not done" : "done"}`}
              />
              <span>{todo.title}</span>
              <button type="button" onClick={() => void run(() => todosApi.remove(todo.id))}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
