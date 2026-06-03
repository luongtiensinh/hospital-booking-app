import { httpClient } from "@/shared/services/http-client";
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/types/auth.types";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  session?: AuthSession;
  user?: AuthUser;
  detail?: string;
} & T;

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    // payload.identifier -> SĐT hoặc CCCD
    const { data } = await httpClient.post<ApiResponse<{}>>(
      "/auth/login",
      payload,
    );
    if (!data.session) throw new Error(data.message || "Login failed.");
    return data.session;
  },

  async register(payload: RegisterPayload): Promise<AuthSession | null> {
    // payload: { fullName, phoneNumber, cccd, password } — không có email
    const { data } = await httpClient.post<ApiResponse<{}>>(
      "/auth/register",
      {
        fullname: payload.fullName,
        phone: payload.phoneNumber,
        cccd: payload.cccd,
        password: payload.password,
      },
    );
    return data.session ?? null;
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const { data } = await httpClient.post<ApiResponse<{}>>("/auth/refresh", {
      refreshToken,
    });
    if (!data.session) throw new Error(data.message || "Refresh failed.");
    return data.session;
  },

  async logout() {
    await httpClient.post("/auth/logout");
  },

  async getProfile(): Promise<AuthUser> {
    const { data } = await httpClient.get<ApiResponse<{}>>("/auth/profile");
    if (!data.user) throw new Error(data.message || "Profile request failed.");
    return data.user;
  },
};
