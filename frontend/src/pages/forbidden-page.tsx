import { LockKeyhole, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { APP_ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

export function ForbiddenPage() {
  return (
    <FullscreenState
      action={
        <Button asChild variant="outline">
          <Link to={APP_ROUTES.dashboard}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Ve trang an toan
          </Link>
        </Button>
      }
      description="Tai khoan hien tai khong co quyen truy cap chuc nang nay. Hay lien he quan tri vien neu ban cho rang day la nham lan."
      icon={LockKeyhole}
      title="403 - Truy cap bi tu choi"
    />
  );
}
