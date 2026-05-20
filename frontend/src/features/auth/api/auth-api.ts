import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/types/auth.types";

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "mock-patient-id",
        fullName: "Nguyễn Văn Bệnh Nhân",
        email: payload.email || "benhnhan@medcare.vn",
        phoneNumber: "0912345678",
        role: "patient",
        avatarUrl: null,
      },
    };
  },

  async register(payload: RegisterPayload) {
    return { success: true };
  },

  async logout() {
    return;
  },

  async getProfile() {
    const response = await httpClient.get<ApiResult<AuthUser>>("/auth/me");

    return unwrapApiResponse(response.data);
  },
};
import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
