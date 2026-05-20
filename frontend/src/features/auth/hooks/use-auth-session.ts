import { useMemo } from "react";

import { useAuthStore } from "@/features/auth/store/auth-store";

const roleLabelMap = {
  patient: "Bệnh nhân",
  doctor: "Bác sĩ",
  admin: "Quản trị viên",
} as const;

export function useAuthSession() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  return useMemo(() => {
    const displayName = user?.fullName ?? "Tài khoản chưa xác định";
    const initials = displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const role = user?.role ?? null;

    return {
      accessToken,
      user,
      role,
      roleLabel: role ? roleLabelMap[role] : "Khách",
      isBootstrapped,
      isAuthenticated: Boolean(accessToken && user),
      displayName,
      initials,
    };
  }, [accessToken, isBootstrapped, user]);
}
