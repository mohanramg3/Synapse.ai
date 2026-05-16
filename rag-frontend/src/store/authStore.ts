  import { create } from "zustand";
  import { authApi, type AuthUser } from "@/lib/api/authApi";
  import { getStoredToken, setStoredToken, toApiError } from "@/lib/api/client";

  type AuthState = {
    user: AuthUser | null;
    token: string | null;
    status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
    error: string | null;
    hydrate: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
  };

  export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: typeof window !== "undefined" ? getStoredToken() : null,
    status: "idle",
    error: null,

    hydrate: async () => {
      const token = getStoredToken();
      if (!token) {
        set({ status: "unauthenticated", user: null, token: null });
        return;
      }
      set({ status: "loading", token });
      try {
        const user = await authApi.me();
        set({ user, status: "authenticated", error: null });
      } catch (err) {
        setStoredToken(null);
        set({ user: null, token: null, status: "unauthenticated", error: toApiError(err).message });
      }
    },

    login: async (email, password) => {
      set({ status: "loading", error: null });
      try {
        const res = await authApi.login({ email, password });
        setStoredToken(res.access_token);
        const user = res.user ?? (await authApi.me());
        set({ token: res.access_token, user, status: "authenticated" });
      } catch (err) {
        const e = toApiError(err);
        set({ status: "error", error: e.message });
        throw err;
      }
    },

    register: async (email, password, name) => {
      set({ status: "loading", error: null });
      try {
        const res = await authApi.register({ email, password, name });
        if ("access_token" in res) {
          setStoredToken(res.access_token);
          const user = res.user ?? (await authApi.me());
          set({ token: res.access_token, user, status: "authenticated" });
          return;
        }
        const loginRes = await authApi.login({ email, password });
        setStoredToken(loginRes.access_token);
        const user = loginRes.user ?? (await authApi.me());
        set({ token: loginRes.access_token, user, status: "authenticated" });
      } catch (err) {
        const e = toApiError(err);
        set({ status: "error", error: e.message });
        throw err;
      }
    },

    logout: () => {
      setStoredToken(null);
      set({ user: null, token: null, status: "unauthenticated" });
      void get;
    },
  }));
