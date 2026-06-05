import type { PropsWithChildren } from "react";

import { LoaderCircle } from "lucide-react";

import { useAuthBootstrap } from "@/features/auth/hooks/use-auth-bootstrap";
import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { HospitalLogo } from "@/shared/ui/hospital-logo";

export function AuthBootstrapper({ children }: PropsWithChildren) {
  const { isLoading } = useAuthBootstrap();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <HospitalLogo
          height={72}
          className="mb-8 animate-pulse"
          containerStyle={{ padding: 14 }}
        />
        <FullscreenState
          description="Đang khởi tạo phiên đăng nhập, đồng bộ quyền truy cập và chuẩn bị dữ liệu giao diện."
          icon={LoaderCircle}
          title="Đang chuẩn bị Hệ thống Y tế số"
        />
      </div>
    );
  }

  return <>{children}</>;
}
