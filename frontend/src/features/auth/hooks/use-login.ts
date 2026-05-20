import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { APP_ROUTES } from "@/shared/constants/routes";
import { getErrorMessage } from "@/shared/utils/error-utils";
import { authService } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { LoginPayload } from "@/features/auth/types/auth.types";

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? APP_ROUTES.dashboard;

  const mutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      setSession(session);
      toast.success("Đăng nhập thành công.");
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đăng nhập thất bại."));
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
  };
}
