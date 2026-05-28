import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { CalendarRange, MapPin, XCircle } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { AppointmentSummary } from "@/features/appointment/types/appointment.types";
import { useCancelAppointment } from "@/features/appointment/hooks/use-cancel-appointment";
import { ConfirmDialog } from "@/shared/components/feedback/confirm-dialog";

const statusColorMap: Record<string, string> = {
  confirmed: "blue",
  "checked-in": "green",
  completed: "green",
  cancelled: "red",
  pending: "yellow",
};

type NextAppointmentCardProps = {
  appointment: AppointmentSummary;
};

export function NextAppointmentCard({ appointment }: NextAppointmentCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelAppointment();

  const handleCancel = () => {
    cancelMutation.mutate(appointment.id, {
      onSuccess: () => {
        setIsCancelDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Card
        radius="lg"
        withBorder
        h="100%"
        style={{ borderColor: "var(--mantine-color-gray-2)" }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Box>
              <Text size="xs" fw={500} c="dimmed">Lịch khám gần nhất</Text>
              <Text fw={700} size="lg" c="dark.8">{appointment.doctorName}</Text>
              <Text size="sm" c="dimmed">{appointment.specialty}</Text>
            </Box>
            <Badge
              color={statusColorMap[appointment.status] ?? "blue"}
              variant="light"
              radius="sm"
              style={{ flexShrink: 0 }}
            >
              {appointment.statusLabel}
            </Badge>
          </Group>

          <Group gap="sm" grow>
            <Paper
              radius="md"
              p="sm"
              style={{ background: "var(--mantine-color-blue-0)", border: "1px solid var(--mantine-color-blue-1)" }}
            >
              <Group gap="xs" mb={4}>
                <ThemeIcon size="sm" color="blue" variant="light" radius="sm">
                  <CalendarRange size={13} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="blue.7">Thời gian</Text>
              </Group>
              <Text size="xs" c="dimmed">{formatDateTime(appointment.appointmentAt)}</Text>
            </Paper>

            <Paper
              radius="md"
              p="sm"
              style={{ background: "var(--mantine-color-teal-0)", border: "1px solid var(--mantine-color-teal-1)" }}
            >
              <Group gap="xs" mb={4}>
                <ThemeIcon size="sm" color="teal" variant="light" radius="sm">
                  <MapPin size={13} />
                </ThemeIcon>
                <Text size="xs" fw={600} c="teal.7">Địa điểm</Text>
              </Group>
              <Text size="xs" c="dimmed">{appointment.location}</Text>
            </Paper>
          </Group>

          {appointment.status === "confirmed" && (
            <Button
              size="sm"
              variant="light"
              color="red"
              radius="md"
              leftSection={<XCircle size={16} />}
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Hủy lịch khám
            </Button>
          )}
        </Stack>
      </Card>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Hủy lịch khám"
        description="Bạn có chắc chắn muốn hủy lịch khám này không? Thao tác này sẽ giải phóng khung giờ cho bệnh nhân khác và không thể hoàn tác."
        confirmText="Đồng ý hủy"
        cancelText="Đóng"
        isConfirming={cancelMutation.isPending}
        onConfirm={handleCancel}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </>
  );
}
