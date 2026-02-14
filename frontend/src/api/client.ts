const BASE_URL = "/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

// Shortcuts
export const api = {
  get: <T = unknown>(url: string) => apiRequest<T>(url),
  post: <T = unknown>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: "POST", body }),
  put: <T = unknown>(url: string, body: unknown) =>
    apiRequest<T>(url, { method: "PUT", body }),
  delete: <T = unknown>(url: string) =>
    apiRequest<T>(url, { method: "DELETE" }),
};
