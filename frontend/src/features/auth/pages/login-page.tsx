import { APP_ROUTES } from "@/shared/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <AuthShell
      description="Đăng nhập để quản lý lịch khám, theo dõi QR check-in và xem hồ sơ kết quả xét nghiệm của bạn."
      footerActionHref={APP_ROUTES.register}
      footerActionLabel="Tạo tài khoản mới"
      footerText="Chưa có tài khoản?"
      heading="Đăng nhập hệ thống"
    >
      <LoginForm />
    </AuthShell>
  );
}
