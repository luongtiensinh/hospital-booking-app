import { AlertOctagon, RefreshCcw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { HospitalLogo } from "@/shared/ui/hospital-logo";
import { Button } from "@/shared/ui/button";

export function RouterErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} - ${error.statusText}`
    : "Đã xảy ra lỗi khi tải trang";
  const description = isRouteErrorResponse(error)
    ? "Route hiện tại không thể hiển thị. Bạn có thể tải lại để thử lại."
    : "Ứng dụng không thể dựng route này. Vui lòng tải lại trình duyệt hoặc kiểm tra cấu hình điều hướng.";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="surface-panel max-w-xl space-y-5 p-8 text-center">
        <HospitalLogo
          height={44}
          className="mx-auto mb-4"
          imageClassName="grayscale opacity-50"
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Tải lại route
        </Button>
      </div>
    </div>
  );
}
