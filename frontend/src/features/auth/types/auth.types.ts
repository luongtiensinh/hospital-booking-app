export type UserRole = "patient" | "doctor" | "admin";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};
