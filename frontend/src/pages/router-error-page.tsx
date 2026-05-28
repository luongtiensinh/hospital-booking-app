import { AlertOctagon, RefreshCcw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { Button } from "@/shared/ui/button";

export function RouterErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} - ${error.statusText}`
    : "Da xay ra loi khi tai trang";
  const description = isRouteErrorResponse(error)
    ? "Route hien tai khong the hien thi. Ban co the tai lai de thu lai."
    : "Ung dung khong the dung route nay. Vui long tai lai trinh duyet hoac kiem tra cau hinh dieu huong.";

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="surface-panel max-w-xl space-y-5 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Tai lai route
        </Button>
      </div>
    </div>
  );
}
