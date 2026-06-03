import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/shared/constants/routes";
import { authService } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { queryClient } from "@/app/providers/query-client";

export function useLogout() {
  const navigate = useNavigate();
  const logoutStore = useAuthStore((state) => state.logout);

  const mutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      navigate(APP_ROUTES.login, { replace: true });
    },
  });

  return {
    logout: () => mutation.mutate(),
    isPending: mutation.isPending,
  };
}
