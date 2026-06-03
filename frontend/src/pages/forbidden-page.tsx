import { LockKeyhole, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@mantine/core";
import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { APP_ROUTES } from "@/shared/constants/routes";

export function ForbiddenPage() {
  return (
    <FullscreenState
      action={
        <Button
          component={Link}
          to={APP_ROUTES.dashboard}
          variant="outline"
          leftSection={<MoveLeft size={16} />}
          radius="md"
        >
          Về trang an toàn
        </Button>
      }
      description="Tai khoan hien tai khong co quyen truy cap chuc nang nay. Hay lien he quan tri vien neu ban cho rang day la nham lan."
      icon={LockKeyhole}
      title="403 - Truy cap bi tu choi"
    />
  );
}
