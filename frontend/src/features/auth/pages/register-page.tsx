import { APP_ROUTES } from "@/shared/constants/routes";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthShell
      description="Tạo tài khoản bệnh nhân để đặt lịch khám trực tuyến, nhận QR check-in và xem kết quả y tế ngay trên điện thoại."
      footerActionHref={APP_ROUTES.login}
      footerActionLabel="Đăng nhập ngay"
      footerText="Đã có tài khoản?"
      heading="Đăng ký tài khoản"
    >
      <RegisterForm />
    </AuthShell>
  );
}
