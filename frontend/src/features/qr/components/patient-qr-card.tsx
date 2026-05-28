import {
  CalendarRange,
  Clock3,
  MapPin,
  RefreshCcw,
  Maximize2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  Button,
  Modal,
  Text,
  Stack,
  Group,
  Paper,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { formatDateTime } from "@/shared/utils/formatters";
import type { LatestAppointmentQr } from "@/features/qr/types/qr.types";

type PatientQrCardProps = {
  qr: LatestAppointmentQr;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function PatientQrCard({
  qr,
  onRefresh,
  isRefreshing = false,
}: PatientQrCardProps) {
  const [opened, { open, close }] = useDisclosure(false);

  // Map backend status to Mantine Badge colors
  const statusColorMap: Record<string, string> = {
    active: "blue",
    used: "green",
    expired: "gray",
    cancelled: "red",
  };

  const appStatusColorMap: Record<string, string> = {
    confirmed: "blue",
    "checked-in": "green",
    completed: "green",
    cancelled: "red",
    pending: "yellow",
  };

  return (
    <>
      <Card
        padding="xl"
        radius="lg"
        withBorder
        className="h-full border-border bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      >
        <Stack gap="md" className="h-full justify-between">
          <div className="space-y-4">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <div>
                <Text size="lg" fw={700} c="blue.9">
                  QR check-in gần nhất
                </Text>
                <Text size="xs" c="dimmed">
                  Đưa mã này cho quầy tiếp nhận để check-in nhanh.
                </Text>
              </div>
              <Group gap="xs" wrap="nowrap">
                <Badge
                  color={statusColorMap[qr.status] || "blue"}
                  variant="light"
                  radius="sm"
                  size="sm"
                >
                  {qr.statusLabel}
                </Badge>
              </Group>
            </Group>

            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              {/* Interactive QR Code Container */}
              <div
                onClick={qr.status === "active" ? open : undefined}
                className={`relative group flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 transition-all duration-300 ${
                  qr.status === "active"
                    ? "cursor-pointer hover:border-blue-300 hover:scale-[1.02] hover:shadow-sm"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <QRCodeSVG
                  bgColor="#ffffff"
                  fgColor={qr.status === "active" ? "#11314d" : "#7d8a96"}
                  includeMargin
                  size={150}
                  value={qr.qrValue}
                />

                {qr.status === "active" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                    <Paper className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-blue-100">
                      <Maximize2 className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-[10px] font-semibold text-blue-700">
                        Phóng to
                      </span>
                    </Paper>
                  </div>
                )}
              </div>

              {/* Details Stack */}
              <Stack gap="xs" justify="center">
                <Paper
                  p="sm"
                  radius="md"
                  className="bg-slate-50 border border-slate-100/50"
                >
                  <Group gap="xs">
                    <ThemeIcon
                      color="blue"
                      variant="light"
                      size="sm"
                      radius="md"
                    >
                      <CalendarRange className="h-3.5 w-3.5" />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={500} c="dimmed">
                        Lịch khám
                      </Text>
                      <Text size="xs" fw={700}>
                        {formatDateTime(qr.appointmentAt)}
                      </Text>
                    </div>
                  </Group>
                </Paper>

                <Paper
                  p="sm"
                  radius="md"
                  className="bg-slate-50 border border-slate-100/50"
                >
                  <Group gap="xs">
                    <ThemeIcon
                      color="orange"
                      variant="light"
                      size="sm"
                      radius="md"
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={500} c="dimmed">
                        Hạn sử dụng mã
                      </Text>
                      <Text size="xs" fw={700}>
                        {formatDateTime(qr.expiresAt)}
                      </Text>
                    </div>
                  </Group>
                </Paper>

                <Paper
                  p="sm"
                  radius="md"
                  className="bg-slate-50 border border-slate-100/50"
                >
                  <Group gap="xs">
                    <ThemeIcon
                      color="teal"
                      variant="light"
                      size="sm"
                      radius="md"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" fw={500} c="dimmed">
                        Bác sĩ & Địa điểm
                      </Text>
                      <Text size="xs" fw={700} className="line-clamp-1">
                        {qr.doctorName} • {qr.specialty} • {qr.location}
                      </Text>
                    </div>
                  </Group>
                </Paper>
              </Stack>
            </div>
          </div>

          {onRefresh && (
            <Button
              disabled={isRefreshing}
              onClick={onRefresh}
              variant="light"
              color="blue"
              radius="md"
              leftSection={
                <RefreshCcw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              }
              className="w-full mt-2"
            >
              {isRefreshing ? "Đang làm mới..." : "Làm mới QR"}
            </Button>
          )}
        </Stack>
      </Card>

      {/* Mantine Zoom Modal */}
      <Modal
        opened={opened}
        onClose={close}
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
          >
            <QRCodeSVG
              bgColor="#ffffff"
              fgColor="#11314d"
              includeMargin
              size={260}
              value={qr.qrValue}
            />
          </Paper>

          <Stack gap="xs" align="center" className="text-center">
            <Text fw={700} size="md" c="blue.9">
              {qr.doctorName}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              {qr.specialty} • {qr.location}
            </Text>
            <Badge
              color={appStatusColorMap[qr.appointmentStatus] || "blue"}
              variant="light"
              radius="md"
              className="mt-1"
            >
              Lịch hẹn: {qr.appointmentStatusLabel}
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
                  Giờ khám:
                </Text>
                <Text size="xs" fw={700}>
                  {formatDateTime(qr.appointmentAt)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Hạn quét mã:
                </Text>
                <Text size="xs" fw={700} c="orange.7">
                  {formatDateTime(qr.expiresAt)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          <Text size="xs" c="dimmed" className="text-center italic">
            Đưa mã này vào máy quét tại quầy đón tiếp để tự động check-in.
          </Text>

          <Button
            onClick={close}
            variant="filled"
            color="blue"
            radius="md"
            className="w-full"
          >
            Đóng
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
