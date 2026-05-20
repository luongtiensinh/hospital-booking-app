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

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    const message = getErrorMessage(error);
    console.error("HTTP client intercepted an API error:", message, error);

    return Promise.reject(error);
  },
);
