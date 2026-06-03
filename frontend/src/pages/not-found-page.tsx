import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@mantine/core";
import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { APP_ROUTES } from "@/shared/constants/routes";

export function NotFoundPage() {
  return (
    <FullscreenState
      action={
        <Button
          component={Link}
          to={APP_ROUTES.dashboard}
          leftSection={<ArrowLeft size={16} />}
          radius="md"
        >
          Quay về trang chủ
        </Button>
      }
      description="Lien ket ban mo khong ton tai hoac da duoc thay doi. Vui long quay lai khu vuc chinh de tiep tuc thao tac."
      icon={SearchX}
      title="Khong tim thay trang"
    />
  );
}
