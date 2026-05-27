import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { authService } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function useAuthBootstrap() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hydrateProfile = useAuthStore((state) => state.hydrateProfile);
  const logout = useAuthStore((state) => state.logout);
  const markBootstrapped = useAuthStore((state) => state.markBootstrapped);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getProfile,
    enabled: Boolean(accessToken && !user),
  });

  useEffect(() => {
    if (!accessToken && !isBootstrapped) {
      markBootstrapped();
    }
  }, [accessToken, isBootstrapped, markBootstrapped]);

  useEffect(() => {
    if (user && !isBootstrapped) {
      markBootstrapped();
    }
  }, [isBootstrapped, markBootstrapped, user]);

  useEffect(() => {
    if (profileQuery.data) {
      hydrateProfile(profileQuery.data);
      markBootstrapped();
    }
  }, [hydrateProfile, markBootstrapped, profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isError) {
      logout();
      markBootstrapped();
    }
  }, [logout, markBootstrapped, profileQuery.isError]);

  return {
    isLoading: !isBootstrapped || profileQuery.isLoading,
  };
}
