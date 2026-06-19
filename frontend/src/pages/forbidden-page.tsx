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
      description="Tài khoản hiện tại không có quyền truy cập chức năng này. Hãy liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn."
      icon={LockKeyhole}
      title="403 - Truy cập bị từ chối"
    />
  );
}
