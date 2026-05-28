import { useState } from "react";
import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { QrCode, XCircle } from "lucide-react";

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

type UpcomingAppointmentCardProps = {
  appointment: AppointmentSummary;
};

export function UpcomingAppointmentCard({ appointment }: UpcomingAppointmentCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const cancelMutation = useCancelAppointment();

  const handleCancel = () => {
    cancelMutation.mutate(appointment.id, {
      onSuccess: () => setIsCancelDialogOpen(false),
    });
  };

  return (
    <>
      <Card radius="lg" withBorder style={{ borderColor: "var(--mantine-color-gray-2)" }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fw={700} size="sm" c="dark.8">{appointment.doctorName}</Text>
              <Text size="xs" c="dimmed">{appointment.specialty} • {appointment.location}</Text>
            </div>
            <Badge
              color={statusColorMap[appointment.status] ?? "blue"}
              variant="light"
              radius="sm"
              size="sm"
              style={{ flexShrink: 0 }}
            >
              {appointment.statusLabel}
            </Badge>
          </Group>

          <Text size="xs" c="dimmed">{formatDateTime(appointment.appointmentAt)}</Text>

          {appointment.status === "confirmed" && (
            <Group gap="xs">
              {appointment.qrCodeUrl && (
                <Button
                  component="a"
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(appointment.qrCodeUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  size="xs"
                  variant="light"
                  color="blue"
                  radius="md"
                  leftSection={<QrCode size={13} />}
                >
                  QR Check-in
                </Button>
              )}
              <Button
                size="xs"
                variant="light"
                color="red"
                radius="md"
                leftSection={<XCircle size={13} />}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Hủy lịch
              </Button>
            </Group>
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
