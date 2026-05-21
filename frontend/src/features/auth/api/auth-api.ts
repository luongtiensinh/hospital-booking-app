import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from "@/features/auth/types/auth.types";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";

export const authApi = {
  // Login – uses Supabase Auth if available, otherwise mock
  async login(payload: LoginPayload): Promise<AuthSession> {
    if (!supabaseEnabled) {
      // Mock response
      return {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "mock-patient-id",
          fullName: payload.email?.split("@")[0] ?? "Nguyễn Văn Bệnh Nhân",
          email: payload.email ?? "benhnhan@medcare.vn",
          phoneNumber: "0912345678",
          role: "patient",
          avatarUrl: null,
        },
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });
    if (error) {
      console.error("Supabase login error:", error);
      throw error;
    }
    const session = data.session;
    const user = data.user;
    return {
      accessToken: session?.access_token ?? "",
      refreshToken: session?.refresh_token ?? "",
      user: {
        id: user?.id ?? "",
        fullName: (user?.user_metadata?.full_name as string) ?? "",
        email: user?.email ?? "",
        phoneNumber: (user?.user_metadata?.phone as string) ?? "",
        role: (user?.app_metadata?.role as string) ?? "patient",
        avatarUrl: (user?.user_metadata?.avatar_url as string) ?? null,
      },
    };
  },

  // Register – Supabase Auth sign‑up, fallback mock
  async register(payload: RegisterPayload) {
    if (!supabaseEnabled) {
      return { success: true };
    }
    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone: payload.phoneNumber,
        },
      },
    });
    if (error) {
      console.error("Supabase register error:", error);
      throw error;
    }
    return { success: true };
  },

  async logout() {
    if (!supabaseEnabled) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Supabase logout error:", error);
  },

  async getProfile(): Promise<AuthUser> {
    if (!supabaseEnabled) {
      return {
        id: "mock-patient-id",
        fullName: "Nguyễn Văn Bệnh Nhân",
        email: "benhnhan@medcare.vn",
        phoneNumber: "0912345678",
        role: "patient",
        avatarUrl: null,
      };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Supabase getProfile error:", error);
      throw error;
    }
    const user = data.user;
    return {
      id: user?.id ?? "",
      fullName: (user?.user_metadata?.full_name as string) ?? "",
      email: user?.email ?? "",
      phoneNumber: (user?.user_metadata?.phone as string) ?? "",
      role: (user?.app_metadata?.role as string) ?? "patient",
      avatarUrl: (user?.user_metadata?.avatar_url as string) ?? null,
    };
  },
};

