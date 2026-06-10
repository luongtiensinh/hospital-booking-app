import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
  Modal,
  Paper,
} from "@mantine/core";
import { QrCode, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

export function UpcomingAppointmentCard({
  appointment,
}: UpcomingAppointmentCardProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const isConfirmed = appointment.status === "confirmed";

  // Calculate if it's eligible for cancellation (must be > 24h away)
  const isEligibleForCancel =
    isConfirmed && dayjs(appointment.appointmentAt).diff(dayjs(), "hour") >= 24;

  // Determine QR status and statusLabel
  const nowDayjs = dayjs();
  const appointmentAtDayjs = dayjs(appointment.appointmentAt);
  const expiresAtDayjs = appointmentAtDayjs.add(30, "minute"); // 30 min grace period from backend

  let qrStatus: "active" | "used" | "expired" | "cancelled" = "active";
  if (appointment.status === "cancelled") {
    qrStatus = "cancelled";
  } else if (
    appointment.status === "checked-in" ||
    appointment.status === "completed"
  ) {
    qrStatus = "used";
  } else if (nowDayjs.isAfter(expiresAtDayjs)) {
    qrStatus = "expired";
  }

  const qrStatusColorMap: Record<string, string> = {
    active: "blue",
    used: "green",
    expired: "gray",
    cancelled: "red",
  };

  const qrStatusLabelMap: Record<string, string> = {
    active: "Còn hiệu lực",
    used: "Đã sử dụng",
    expired: "Đã hết hạn",
    cancelled: "Đã hủy",
  };

  return (
    <>
      <Card
        radius="lg"
        withBorder
        style={{ borderColor: "var(--mantine-color-gray-2)" }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fw={700} size="sm" c="dark.8">
                {appointment.counterName}
              </Text>
              <Text size="xs" c="dimmed">
                Phòng: {appointment.counterRoom}
              </Text>
              <Text size="xs" fw={700} c="sky.8">
                Mã khám: {appointment.id.substring(0, 8).toUpperCase()}
              </Text>
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

          <Text size="sm" fw={500} c="dark.7">
            {formatDateTime(appointment.appointmentAt)}
          </Text>

          {(appointment.qrCodeUrl || isConfirmed) && (
            <Group gap="xs" mt="sm">
              {appointment.qrCodeUrl && (
                <Button
                  onClick={() => setIsQrModalOpen(true)}
                  size="xs"
                  variant="light"
                  color="blue"
                  radius="md"
                  leftSection={<QrCode size={13} />}
                >
                  QR Check-in
                </Button>
              )}

              {isConfirmed && (
                <Tooltip
                  label={
                    !isEligibleForCancel
                      ? "Chỉ được phép hủy trước 24 giờ so với giờ khám"
                      : ""
                  }
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
              )}
            </Group>
          )}
        </Stack>
      </Card>

      {/* QR Check-in Modal */}
      {appointment.qrCodeUrl && (
        <Modal
          opened={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title={
            <Text fw={700} size="lg">
              Mã QR Check-in Lịch Khám
            </Text>
          }
          centered
          radius="lg"
          padding="xl"
          transitionProps={{ transition: "pop", duration: 250 }}
          className="[&_.mantine-Modal-header]:border-b [&_.mantine-Modal-header]:pb-3"
        >
          <Stack gap="xl" align="center">
            <Paper
              withBorder
              radius="xl"
              p="md"
              className="bg-white border-slate-100 shadow-md shadow-slate-100/50"
              style={{
                opacity: qrStatus === "active" ? 1 : 0.7,
                position: "relative",
              }}
            >
              <QRCodeSVG
                bgColor="#ffffff"
                fgColor={qrStatus === "active" ? "#11314d" : "#7d8a96"}
                includeMargin
                size={240}
                value={appointment.qrCodeUrl}
              />
              <Text
                size="sm"
                fw={800}
                c="blue.9"
                mt="xs"
                style={{ textAlign: "center" }}
              >
                MÃ CHECK-IN: {appointment.id.substring(0, 8).toUpperCase()}
              </Text>
              {qrStatus !== "active" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "var(--mantine-radius-xl)",
                    backdropFilter: "blur(1px)",
                  }}
                >
                  <Badge
                    color={qrStatusColorMap[qrStatus]}
                    size="lg"
                    variant="filled"
                  >
                    {qrStatusLabelMap[qrStatus]}
                  </Badge>
                </div>
              )}
            </Paper>

            <Stack gap="xs" align="center" className="text-center">
              <Text fw={700} size="md" c="blue.9">
                {appointment.counterName}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                Phòng: {appointment.counterRoom}
              </Text>
              <Badge
                color={statusColorMap[appointment.status] || "blue"}
                variant="light"
                radius="md"
                className="mt-1"
              >
                Trạng thái: {appointment.statusLabel}
              </Badge>
            </Stack>

            <Paper
              p="md"
              radius="lg"
              className="w-full bg-blue-50/50 border border-blue-100/50"
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Thời gian khám:
                  </Text>
                  <Text size="xs" fw={700}>
                    {formatDateTime(appointment.appointmentAt)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Hạn quét mã:
                  </Text>
                  <Text
                    size="xs"
                    fw={700}
                    c={qrStatus === "active" ? "orange.7" : "dimmed"}
                  >
                    {formatDateTime(expiresAtDayjs.toISOString())}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            <Text size="xs" c="dimmed" className="text-center italic">
              {qrStatus === "active"
                ? "Đưa mã này vào máy quét tại quầy đón tiếp để tự động check-in."
                : "Mã QR này không còn hiệu lực để check-in."}
            </Text>

            <Button
              onClick={() => setIsQrModalOpen(false)}
              variant="filled"
              color="blue"
              radius="md"
              className="w-full"
            >
              Đóng
            </Button>
          </Stack>
        </Modal>
      )}

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
