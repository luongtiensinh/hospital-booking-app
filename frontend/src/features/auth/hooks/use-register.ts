import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { APP_ROUTES } from "@/shared/constants/routes";
import { getErrorMessage } from "@/shared/utils/error-utils";
import { authService } from "@/features/auth/services/auth-service";
import type { RegisterPayload } from "@/features/auth/types/auth.types";

export function useRegister() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      toast.success("Tạo tài khoản thành công. Mời bạn đăng nhập.");
      navigate(APP_ROUTES.login, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đăng ký thất bại."));
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
  };
}
