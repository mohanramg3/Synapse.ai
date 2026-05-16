import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "atlas.auth.token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
};

const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://127.0.0.1:8000";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] ${response.status} ${response.config.url}`, response.data);
    const authorization = response.headers?.authorization;
    if (typeof authorization === "string" && authorization.toLowerCase().startsWith("bearer ")) {
      setStoredToken(authorization.slice(7).trim());
    }
    return response;
  },
  (error) => {
    console.error(`❌ [API] ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
    // Centralized error normalization. Refresh-token logic can hook here later.
    if (error?.response?.status === 401) {
      // Token invalid — clear and let route guards redirect.
      setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

export type ApiError = {
  status?: number;
  message: string;
  detail?: unknown;
};

export const toApiError = (err: unknown): ApiError => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    let message = data?.detail || data?.message || err.message;

    // Handle FastAPI validation error array
    if (Array.isArray(data?.detail)) {
      message = data.detail.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join(", ");
    } else if (typeof data?.detail === "object" && data?.detail !== null) {
      message = JSON.stringify(data.detail);
    }

    return {
      status: err.response?.status,
      message: String(message),
      detail: data,
    };
  }
  if (err instanceof Error) return { message: err.message };
  return { message: "Unknown error" };
};

export const unwrapArray = <T>(value: unknown, key: string): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const nested = (value as Record<string, unknown>)[key];
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
};
