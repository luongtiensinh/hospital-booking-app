import { Camera, RotateCcw, ScanLine } from "lucide-react";
import { Card, Button, Text, Stack, Group, Paper, ThemeIcon } from "@mantine/core";

import type {
  CameraPermissionState,
  ScanLifecycleState,
} from "@/features/qr/types/qr.types";

type QrScannerPanelProps = {
  containerId: string;
  permission: CameraPermissionState;
  status: ScanLifecycleState;
  isActive: boolean;
  onStart: () => void;
  onRetry: () => void;
};

export function QrScannerPanel({
  containerId,
  permission,
  status,
  isActive,
  onStart,
  onRetry,
}: QrScannerPanelProps) {
  const description =
    permission === "denied"
      ? "Camera đã bị từ chối. Hãy cấp quyền truy cập camera trong cài đặt trình duyệt rồi thử lại."
      : status === "verifying"
        ? "Đang xác thực mã QR với máy chủ..."
        : "Hướng camera của thiết bị vào mã QR lịch hẹn để check-in tự động.";

  return (
    <Card
      padding="xl"
      radius="lg"
      withBorder
      className="h-full border-border bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <Stack gap="md" className="h-full justify-between">
        <div className="space-y-4">
          <div>
            <Text size="lg" fw={700} c="blue.9">
              Quét mã QR tiếp đón
            </Text>
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          </div>

          <Paper
            radius="xl"
            className="overflow-hidden border border-slate-900 bg-slate-950 shadow-inner shadow-black/40"
          >
            <div
              className="flex min-h-[320px] items-center justify-center text-white"
              id={containerId}
            >
              {!isActive ? (
                <Stack gap="sm" align="center" px="md" className="text-center">
                  <ThemeIcon
                    size={64}
                    radius={100}
                    color="white"
                    variant="light"
                    className="bg-white/10 text-white"
                  >
                    <Camera className="h-7 w-7 text-white" />
                  </ThemeIcon>
                  <Text size="sm" c="white" fw={500} className="opacity-75">
                    {permission === "denied"
                      ? "Không thể truy cập camera thiết bị."
                      : "Sẵn sàng mở camera để quét mã QR."}
                  </Text>
                </Stack>
              ) : null}
            </div>
          </Paper>
        </div>

        <Group gap="sm" grow className="mt-2">
          <Button
            onClick={onStart}
            disabled={isActive || status === "verifying"}
            variant="filled"
            color="blue"
            radius="md"
            leftSection={<ScanLine className="h-4 w-4" />}
            size="sm"
          >
            {isActive ? "Đang quét..." : "Bắt đầu quét"}
          </Button>

          <Button
            onClick={onRetry}
            variant="outline"
            color="blue"
            radius="md"
            leftSection={<RotateCcw className="h-4 w-4" />}
            size="sm"
          >
            Quét mới
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
