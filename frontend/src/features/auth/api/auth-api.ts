import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/types/auth.types";

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await httpClient.post<ApiResult<AuthSession>>(
      "/auth/login",
      payload,
    );

    return unwrapApiResponse(response.data);
  },

  async register(payload: RegisterPayload) {
    const response = await httpClient.post<ApiResult<{ success: boolean }>>(
      "/auth/register",
      payload,
    );

    return unwrapApiResponse(response.data);
  },

  async logout() {
    await httpClient.post("/auth/logout");
  },

  async getProfile() {
    const response = await httpClient.get<ApiResult<AuthUser>>("/auth/me");

    return unwrapApiResponse(response.data);
  },
};
