import { APP_ROUTES } from "@/shared/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <AuthShell
      description=""
      footerActionHref={APP_ROUTES.register}
      footerActionLabel="Tạo tài khoản mới"
      footerText="Chưa có tài khoản?"
      heading="Đăng nhập hệ thống"
    >
      <LoginForm />
    </AuthShell>
  );
}
