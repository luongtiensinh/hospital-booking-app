import { AlertTriangle, CheckCircle2, CopyCheck, RefreshCcw, ShieldAlert, Ban } from "lucide-react";
import { Card, Button, Text, Stack, Group, Paper, ThemeIcon, Badge } from "@mantine/core";

import { formatDateTime } from "@/shared/utils/formatters";
import type {
  ScanLifecycleState,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";

type QrVerifyResultCardProps = {
  status: ScanLifecycleState;
  result: VerifyQrResponse | null;
  onRetry: () => void;
};

export function QrVerifyResultCard({
  status,
  result,
  onRetry,
}: QrVerifyResultCardProps) {
  // Determine color and icons based on verification state
  const colorMap = {
    idle: "blue",
    scanning: "blue",
    verifying: "blue",
    success: "green",
    duplicate: "yellow",
    invalid: "red",
    error: "red",
  } as const;

  const getStatusDetails = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle2,
          color: colorMap.success,
          title: "Check-in thành công",
          badgeLabel: "Hợp lệ",
        };
      case "duplicate":
        return {
          icon: CopyCheck,
          color: colorMap.duplicate,
          title: "Đã check-in rồi",
          badgeLabel: "Quét trùng",
        };
      case "invalid":
        return {
          icon: ShieldAlert,
          color: colorMap.invalid,
          title: "QR không hợp lệ",
          badgeLabel: "Từ chối",
        };
      case "error":
        return {
          icon: Ban,
          color: colorMap.error,
          title: "Lỗi hệ thống",
          badgeLabel: "Lỗi",
        };
      default:
        return {
          icon: AlertTriangle,
          color: colorMap.idle,
          title: "Sẵn sàng quét mã",
          badgeLabel: "Chờ quét",
        };
    }
  };

  const { icon: Icon, color, title, badgeLabel } = getStatusDetails();

  return (
    <Card
      padding="xl"
      radius="lg"
      withBorder
      className="h-full border-border bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <Stack gap="md" className="h-full justify-between">
        <div className="space-y-4">
          <Group justify="space-between" align="center">
            <div>
              <Text size="lg" fw={700} c="blue.9">
                Kết quả xác thực
              </Text>
              <Text size="xs" c="dimmed">
                Thông tin chi tiết về mã QR sau khi máy chủ phản hồi.
              </Text>
            </div>
            <Badge color={color} variant="light" radius="sm" size="sm">
              {badgeLabel}
            </Badge>
          </Group>

          <Paper
            p="md"
            radius="lg"
            className={`border transition-colors duration-300 ${status === "success"
              ? "bg-emerald-50/50 border-emerald-100"
              : status === "duplicate"
                ? "bg-amber-50/50 border-amber-100"
                : status === "invalid" || status === "error"
                  ? "bg-rose-50/50 border-rose-100"
                  : "bg-slate-50 border-slate-100"
              }`}
          >
            <Group gap="md" align="flex-start" wrap="nowrap">
              <ThemeIcon color={color} variant="light" size="lg" radius="md">
                <Icon className="h-5 w-5" />
              </ThemeIcon>
              <div className="space-y-1">
                <Text size="sm" fw={700} c={`${color}.9`}>
                  {title}
                </Text>
                <Text size="xs" className="leading-relaxed text-slate-600">
                  {result?.message ?? "Vui lòng hướng camera vào mã QR lịch khám của bệnh nhân để tiến hành đối soát tiếp đón."}
                </Text>
              </div>
            </Group>

            {result?.appointmentAt ? (
              <Stack gap="xs" className="mt-4 pt-4 border-t border-dashed border-slate-200/60 text-xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Bệnh nhân:</Text>
                  <Text size="xs" fw={700}>{result.patientName ?? "--"}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Bác sĩ:</Text>
                  <Text size="xs" fw={700}>{result.doctorName ?? "--"}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Thời gian hẹn:</Text>
                  <Text size="xs" fw={700}>{formatDateTime(result.appointmentAt)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Phòng khám:</Text>
                  <Text size="xs" fw={700}>{result.location ?? "--"}</Text>
                </Group>
                {result.checkedInAt ? (
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">Thời gian quét:</Text>
                    <Text size="xs" fw={700} c="green.7">{formatDateTime(result.checkedInAt)}</Text>
                  </Group>
                ) : null}
              </Stack>
            ) : null}
          </Paper>
        </div>

        <Button
          onClick={onRetry}
          variant="outline"
          color="blue"
          radius="md"
          leftSection={<RefreshCcw className="h-4 w-4" />}
          className="w-full mt-2"
          size="sm"
        >
          Quét tiếp / Thử lại
        </Button>
      </Stack>
    </Card>
  );
}
