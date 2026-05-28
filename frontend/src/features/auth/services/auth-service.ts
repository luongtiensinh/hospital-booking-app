import { authApi } from "@/features/auth/api/auth-api";
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/features/auth/types/auth.types";

function normalizeUser(user: AuthUser): AuthUser {
  return {
    ...user,
    avatarUrl: user.avatarUrl ?? null,
  };
}

function normalizeSession(session: AuthSession): AuthSession {
  return {
    ...session,
    user: normalizeUser(session.user),
  };
}

export const authService = {
  async login(payload: LoginPayload) {
    const session = await authApi.login(payload);
    return normalizeSession(session);
  },

  async register(payload: RegisterPayload) {
    return authApi.register(payload);
  },

  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn("Logout request failed, clearing local session only.", error);
    }
  },

  async getProfile() {
    const profile = await authApi.getProfile();
    return normalizeUser(profile);
  },
};
