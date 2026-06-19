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
      description="Liên kết bạn mở không tồn tại hoặc đã được thay đổi. Vui lòng quay lại khu vực chính để tiếp tục thao tác."
      icon={SearchX}
      title="Không tìm thấy trang"
    />
  );
}
