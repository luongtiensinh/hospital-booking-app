import { useEffect, useState } from "react";

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

  // Wait for Zustand persist to finish rehydrating from localStorage
  // before running any bootstrap logic to prevent race condition on CI
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return unsub;
  }, []);

  const profileQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authService.getProfile,
    // Only fetch profile after hydration, and only when token exists but user doesn't
    enabled: hasHydrated && Boolean(accessToken && !user),
  });

  // Case 1: No token after hydration → mark done immediately (guest user)
  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken && !isBootstrapped) {
      markBootstrapped();
    }
  }, [hasHydrated, accessToken, isBootstrapped, markBootstrapped]);

  // Case 2: Token + user both in store → mark done immediately
  useEffect(() => {
    if (!hasHydrated) return;
    if (user && !isBootstrapped) {
      markBootstrapped();
    }
  }, [hasHydrated, isBootstrapped, markBootstrapped, user]);

  // Case 3: Token exists, user fetched from API successfully
  useEffect(() => {
    if (profileQuery.data) {
      hydrateProfile(profileQuery.data);
      markBootstrapped();
    }
  }, [hydrateProfile, markBootstrapped, profileQuery.data]);

  // Case 4: Token exists but API failed → logout and mark done
  useEffect(() => {
    if (profileQuery.isError) {
      logout();
      markBootstrapped();
    }
  }, [logout, markBootstrapped, profileQuery.isError]);

  return {
    isLoading: !hasHydrated || !isBootstrapped || profileQuery.isLoading,
  };
}
