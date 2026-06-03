export type UserRole = "patient" | "doctor" | "admin";

export type AuthUser = {
  id: string;
  fullName: string;
  phoneNumber: string;
  cccd?: string;
  role: UserRole;
  avatarUrl?: string | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  phoneNumber: string;
  cccd: string;
  password: string;
};
