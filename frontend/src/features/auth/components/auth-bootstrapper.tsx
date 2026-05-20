import type { PropsWithChildren } from "react";

import { LoaderCircle } from "lucide-react";

import { useAuthBootstrap } from "@/features/auth/hooks/use-auth-bootstrap";
import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";

export function AuthBootstrapper({ children }: PropsWithChildren) {
  const { isLoading } = useAuthBootstrap();

  if (isLoading) {
    return (
      <FullscreenState
        description="Đang khởi tạo phiên đăng nhập, đồng bộ quyền truy cập và chuẩn bị dữ liệu giao diện."
        icon={LoaderCircle}
        title="Đang chuẩn bị MedCare Portal"
      />
    );
  }

  return <>{children}</>;
}
