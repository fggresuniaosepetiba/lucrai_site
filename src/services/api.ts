export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5099";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("lucrai-access-token") : null;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuth) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      const newToken = sessionStorage.getItem("lucrai-access-token");
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
    } else {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Sessão expirada");
    }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `Erro ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function attemptRefresh(): Promise<boolean> {
  const refreshToken = typeof window !== "undefined" ? sessionStorage.getItem("lucrai-refresh-token") : null;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    sessionStorage.setItem("lucrai-access-token", data.accessToken);
    sessionStorage.setItem("lucrai-refresh-token", data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function clearAuth(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("lucrai-access-token");
  sessionStorage.removeItem("lucrai-refresh-token");
  sessionStorage.removeItem("lucrai-auth");
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown, skipAuth?: boolean) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      skipAuth,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: "POST",
      body: formData,
    }),
};
