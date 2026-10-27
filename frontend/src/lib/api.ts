// The browser calls its own origin: the gateway routes /api to the backend and
// strips the prefix. The base is inlined at build time; only local setups
// without a gateway override it (readiness rules A2, A17).
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

export function apiUrl(path: string, base: string = API_BASE): string {
  const left = base.endsWith("/") ? base.slice(0, -1) : base;
  const right = path.startsWith("/") ? path.slice(1) : path;
  return `${left}/${right}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }
  });
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const todosApi = {
  list: () => request<Todo[]>("/todos"),
  create: (title: string) =>
    request<Todo>("/todos", { method: "POST", body: JSON.stringify({ title }) }),
  update: (id: string, patch: Partial<Pick<Todo, "title" | "done">>) =>
    request<Todo>(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  remove: (id: string) => request<void>(`/todos/${id}`, { method: "DELETE" })
};
