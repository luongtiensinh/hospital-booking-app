import {
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { CalendarCheck2, MapPin, Stethoscope } from "lucide-react";

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
      icon: Stethoscope,
      color: "blue",
      label: "Bác sĩ",
      value: draft.doctorName ?? "Chưa chọn bác sĩ",
    },
    {
      icon: CalendarCheck2,
      color: "orange",
      label: "Ngày & Giờ",
      value: draft.appointmentDate
        ? `${formatDate(draft.appointmentDate)}${draft.slotLabel ? ` • ${draft.slotLabel}` : ""}`
        : "Chưa chọn ngày",
    },
    {
      icon: MapPin,
      color: "teal",
      label: "Chuyên khoa & Địa điểm",
      value: draft.specialty
        ? `${draft.specialty}${draft.location ? ` • ${draft.location}` : ""}`
        : "Chưa chọn chuyên khoa",
    },
  ];

  return (
    <Card
      radius="lg"
      withBorder
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Stack gap="sm">
        <div>
          <Text fw={700} size="sm" c="dark.8">
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
                <ThemeIcon size="sm" color={color} variant="light" radius="sm">
                  <Icon size={12} />
                </ThemeIcon>
                <div style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {label}
                  </Text>
                  <Text size="xs" fw={600} c="dark.7" truncate>
                    {value}
                  </Text>
                </div>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Button
          fullWidth
          size="sm"
          radius="md"
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
