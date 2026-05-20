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

  async getProfile(): Promise<AuthUser> {
    return {
      id: "mock-patient-id",
      fullName: "Nguyễn Văn Bệnh Nhân",
      email: "benhnhan@medcare.vn",
      phoneNumber: "0912345678",
      role: "patient",
      avatarUrl: null,
    };
  },
};

