import { APP_ROUTES } from "@/shared/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthShell
      description=""
      footerActionHref={APP_ROUTES.login}
      footerActionLabel="Đăng nhập ngay"
      footerText="Đã có tài khoản?"
      heading="Đăng ký tài khoản"
    >
      <RegisterForm />
    </AuthShell>
  );
}
