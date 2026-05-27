import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { APP_ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

export function NotFoundPage() {
  return (
    <FullscreenState
      action={
        <Button asChild>
          <Link to={APP_ROUTES.dashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay ve dashboard
          </Link>
        </Button>
      }
      description="Lien ket ban mo khong ton tai hoac da duoc thay doi. Vui long quay lai khu vuc chinh de tiep tuc thao tac."
      icon={SearchX}
      title="Khong tim thay trang"
    />
  );
}
