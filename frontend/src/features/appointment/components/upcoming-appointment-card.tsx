import { useState } from "react";
import { Badge, Button, Card, Group, Stack, Text, Tooltip } from "@mantine/core";
import { QrCode, XCircle } from "lucide-react";
import dayjs from "dayjs";

import { formatDateTime } from "@/shared/utils/formatters";
import type { AppointmentSummary } from "@/features/appointment/types/appointment.types";
import { CancelAppointmentDialog } from "./cancel-appointment-dialog";

const statusColorMap: Record<string, string> = {
  confirmed: "blue",
  "checked-in": "green",
  completed: "teal",
  cancelled: "red",
  pending: "yellow",
};

type UpcomingAppointmentCardProps = {
  appointment: AppointmentSummary;
};

export function UpcomingAppointmentCard({ appointment }: UpcomingAppointmentCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const isConfirmed = appointment.status === "confirmed";
  
  // Calculate if it's eligible for cancellation (must be > 24h away)
  const isEligibleForCancel = isConfirmed && dayjs(appointment.appointmentAt).diff(dayjs(), "hour") >= 24;

  return (
    <>
      <Card radius="lg" withBorder style={{ borderColor: "var(--mantine-color-gray-2)" }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fw={700} size="sm" c="dark.8">{appointment.counterName}</Text>
              <Text size="xs" c="dimmed">Phòng: {appointment.counterRoom}</Text>
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

          <Text size="sm" fw={500} c="dark.7">{formatDateTime(appointment.appointmentAt)}</Text>

          {isConfirmed && (
            <Group gap="xs" mt="sm">
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
              
              <Tooltip
                label={!isEligibleForCancel ? "Chỉ được phép hủy trước 24 giờ so với giờ khám" : ""}
                disabled={isEligibleForCancel}
              >
                <div>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    radius="md"
                    leftSection={<XCircle size={13} />}
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={!isEligibleForCancel}
                  >
                    Hủy lịch
                  </Button>
                </div>
              </Tooltip>
            </Group>
          )}
        </Stack>
      </Card>

      {isCancelDialogOpen && (
        <CancelAppointmentDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          appointmentId={appointment.id}
          counterName={appointment.counterName}
          appointmentAt={appointment.appointmentAt}
        />
      )}
    </>
  );
}
