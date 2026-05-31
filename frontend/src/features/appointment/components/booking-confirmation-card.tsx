import {
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Alert
} from "@mantine/core";
import { CalendarCheck2, MapPin, Activity, Info } from "lucide-react";

import { formatDate } from "@/shared/utils/formatters";
import type { BookingDraft } from "@/features/appointment/types/appointment.types";

type BookingConfirmationCardProps = {
  draft: BookingDraft;
  canConfirm: boolean;
  isPending: boolean;
  onConfirm: () => void;
};

export function BookingConfirmationCard({
  draft,
  canConfirm,
  isPending,
  onConfirm,
}: BookingConfirmationCardProps) {
  const rows = [
    {
      icon: Activity,
      color: "sky",
      label: "Quầy tiếp nhận",
      value: draft.counterName ?? "Chưa chọn quầy",
    },
    {
      icon: MapPin,
      color: "teal",
      label: "Phòng",
      value: draft.counterRoom ?? "---",
    },
    {
      icon: CalendarCheck2,
      color: "orange",
      label: "Ngày & Giờ",
      value: draft.appointmentDate
        ? `${formatDate(draft.appointmentDate)}${draft.slotLabel ? ` • ${draft.slotLabel}` : ""}`
        : "Chưa chọn ngày",
    },
  ];

  return (
    <Card
      radius="lg"
      withBorder
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Stack gap="md">
        <div>
          <Text fw={700} size="md" c="dark.8">
            Xác nhận đặt lịch
          </Text>
        </div>

        <Stack gap="xs">
          {rows.map(({ icon: Icon, color, label, value }) => (
            <Paper
              key={label}
              p="xs"
              radius="md"
              style={{ background: "var(--mantine-color-gray-0)" }}
            >
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size="md" color={color} variant="light" radius="md">
                  <Icon size={16} />
                </ThemeIcon>
                <div style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {label}
                  </Text>
                  <Text size="sm" fw={600} c="dark.9" truncate>
                    {value}
                  </Text>
                </div>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Alert variant="light" color="blue" title="Thông tin" icon={<Info size={16} />}>
          <Text size="xs">
            Sau khi xác nhận đặt lịch thành công, bạn sẽ nhận được một mã QR Code dùng để check-in tại bệnh viện.
          </Text>
        </Alert>

        <Button
          fullWidth
          size="md"
          radius="md"
          color="sky"
          disabled={!canConfirm || isPending}
          loading={isPending}
          onClick={onConfirm}
          type="button"
        >
          {isPending ? "Đang tạo lịch hẹn..." : "Xác nhận đặt lịch"}
        </Button>
      </Stack>
    </Card>
  );
}
