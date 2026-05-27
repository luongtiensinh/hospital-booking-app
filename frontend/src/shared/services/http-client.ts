import axios from "axios";

import { env } from "@/lib/env";
import { getErrorMessage } from "@/shared/utils/error-utils";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type RetryableConfig = Parameters<(typeof httpClient.interceptors.response)["use"]>[1] extends (
  error: infer E,
) => any
  ? E extends { config: infer C }
  ? C & { _retry?: boolean }
  : any
  : any;

type RefreshResponse = {
  success: boolean;
  message?: string;
  detail?: string;
  session?: {
    accessToken: string;
    refreshToken?: string;
    user: unknown;
  };
};

let refreshPromise: Promise<string | null> | null = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const config = error.config as RetryableConfig | undefined;

      if (config && !config._retry) {
        config._retry = true;

        const { refreshToken } = useAuthStore.getState();
        if (refreshToken) {
          try {
            if (!refreshPromise) {
              // Use a plain axios call to avoid circular deps (httpClient <-> authApi).
              const refreshClient = axios.create({
                baseURL: env.VITE_API_BASE_URL,
                timeout: 15000,
                headers: { "Content-Type": "application/json" },
              });


              refreshPromise = refreshClient
                .post<RefreshResponse>("/auth/refresh", { refreshToken })
                .then((res) => {
                  const session = res.data.session;
                  if (!session?.accessToken) return null;
                  useAuthStore.getState().setSession({
                    accessToken: session.accessToken,
                    refreshToken: session.refreshToken,
                    user: useAuthStore.getState().user ?? (session.user as any),
                  });
                  return session.accessToken;
                })
                .catch(() => null)
                .finally(() => {
                  refreshPromise = null;
                });
            }

            const newAccessToken = await refreshPromise;
            if (newAccessToken) {
              config.headers = config.headers ?? {};
              config.headers.Authorization = `Bearer ${newAccessToken}`;
              return httpClient.request(config);
            }
          } catch {
            // fall through to logout below
          }
        }
      }

      useAuthStore.getState().logout();
    }

    const message = getErrorMessage(error);
    console.error("HTTP client intercepted an API error:", message, error);

    return Promise.reject(error);
  },
);
