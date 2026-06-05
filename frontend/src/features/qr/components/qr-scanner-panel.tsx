import { Camera, RotateCcw, ScanLine, KeyboardIcon, ArrowRight, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { useState } from "react";
import {
  Card,
  Button,
  Text,
  Stack,
  Group,
  Paper,
  ThemeIcon,
  TextInput,
  Divider,
  ActionIcon,
  Box,
} from "@mantine/core";

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
  onManualSubmit?: (value: string) => void;
};

/**
 * Returns an overlay element shown on top of the camera viewport
 * after a scan has been processed (success, invalid, expired, duplicate, error).
 */
function ScanResultOverlay({ status }: { status: ScanLifecycleState }) {
  if (status === "idle" || status === "scanning" || status === "verifying") {
    return null;
  }

  const config = {
    success: {
      icon: CheckCircle2,
      color: "green" as const,
      bg: "bg-emerald-950/80",
      border: "border-emerald-500/40",
      label: "Quét thành công!",
    },
    duplicate: {
      icon: Clock,
      color: "yellow" as const,
      bg: "bg-amber-950/80",
      border: "border-amber-500/40",
      label: "Đã check-in rồi",
    },
    expired: {
      icon: Clock,
      color: "orange" as const,
      bg: "bg-orange-950/80",
      border: "border-orange-500/40",
      label: "Mã đã hết hạn",
    },
    invalid: {
      icon: AlertTriangle,
      color: "red" as const,
      bg: "bg-rose-950/80",
      border: "border-rose-500/40",
      label: "Mã không hợp lệ",
    },
    error: {
      icon: XCircle,
      color: "red" as const,
      bg: "bg-rose-950/80",
      border: "border-rose-500/40",
      label: "Lỗi hệ thống",
    },
  };

  const c = config[status as keyof typeof config];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <div className={`absolute inset-0 z-10 flex items-center justify-center ${c.bg} backdrop-blur-sm`}>
      <div className={`flex flex-col items-center gap-3 px-6 py-4 rounded-2xl border ${c.border} bg-white/5`}>
        <ThemeIcon color={c.color} size={52} radius="xl" variant="light">
          <Icon className="h-7 w-7" />
        </ThemeIcon>
        <Text size="sm" fw={700} c="white" ta="center">
          {c.label}
        </Text>
        <Text size="xs" c="white" ta="center" opacity={0.6}>
          Nhấn "Quét mới" để quét lại
        </Text>
      </div>
    </div>
  );
}

export function QrScannerPanel({
  containerId,
  permission,
  status,
  isActive,
  onStart,
  onRetry,
  onManualSubmit,
}: QrScannerPanelProps) {
  const [manualCode, setManualCode] = useState("");

  const description =
    permission === "denied"
      ? "Camera đã bị từ chối. Hãy cấp quyền truy cập camera trong cài đặt trình duyệt rồi thử lại."
      : status === "verifying"
        ? "Đang xác thực mã QR với máy chủ..."
        : "Hướng camera của thiết bị vào mã QR lịch hẹn để check-in tự động.";

  const handleManualSubmit = () => {
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    onManualSubmit?.(trimmed);
    setManualCode("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleManualSubmit();
  };

  const isVerifying = status === "verifying";
  const isDone = !isActive && status !== "idle" && status !== "scanning" && status !== "verifying";

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

          {/* Camera viewport */}
          <Paper
            radius="xl"
            className="overflow-hidden border border-slate-900 bg-slate-950 shadow-inner shadow-black/40"
          >
            <div className="relative flex min-h-[260px] w-full items-center justify-center text-white">
              {/* Placeholder when not active and idle */}
              {!isActive && !isDone && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
                  <Stack gap="sm" align="center" px="md" className="text-center py-8">
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
                        : "Đang khởi động camera..."}
                    </Text>
                  </Stack>
                </div>
              )}

              {/* Result overlay after scan */}
              <ScanResultOverlay status={status} />

              {/* Camera scanner element - managed by html5-qrcode */}
              <div
                id={containerId}
                className="w-full min-h-[260px]"
              />
            </div>
          </Paper>

          {/* Scanning animation indicator */}
          {isActive && (
            <Box className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <Text size="xs" c="green.7" fw={600}>
                Camera đang hoạt động — hướng vào mã QR
              </Text>
            </Box>
          )}
        </div>

        {/* Camera action buttons */}
        <Group gap="sm" grow className="mt-2">
          <Button
            onClick={onStart}
            disabled={isActive || isVerifying}
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

        {/* Divider — manual input section */}
        <Divider
          label={
            <Group gap={6}>
              <KeyboardIcon size={13} />
              <Text size="xs" fw={600} c="dimmed">
                HOẶC NHẬP MÃ THỦ CÔNG
              </Text>
            </Group>
          }
          labelPosition="center"
          my={2}
        />

        {/* Manual code input */}
        <Stack gap="xs">
          <Text size="xs" c="dimmed" ta="center">
            Dùng khi không mở được camera — nhập 8 ký tự đầu mã check-in của bệnh nhân
          </Text>
          <Group gap="xs" align="flex-end">
            <TextInput
              flex={1}
              placeholder="Nhập mã QR hoặc mã check-in (8 ký tự)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              disabled={isVerifying}
              radius="md"
              size="sm"
              leftSection={<KeyboardIcon size={15} />}
              styles={{
                input: {
                  fontFamily: "monospace",
                  fontSize: 13,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                },
              }}
            />
            <ActionIcon
              size={36}
              radius="md"
              variant="filled"
              color="teal"
              disabled={!manualCode.trim() || isVerifying}
              onClick={handleManualSubmit}
              title="Xác nhận mã"
            >
              <ArrowRight size={17} />
            </ActionIcon>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}
