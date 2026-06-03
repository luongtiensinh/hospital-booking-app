import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Skeleton,
  ThemeIcon,
} from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/shared/services/http-client";
import dayjs from "dayjs";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
type AppointmentForDoctor = {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string | null;
  slot_id: string;
  status: string;
  doctor_name: string | null;
  specialty: string | null;
  notes: string | null;
  profiles: {
    fullname: string;
    phone: string;
  } | null;
};

// ---------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  confirmed: { label: "Đã xác nhận", color: "blue", icon: CalendarClock },
  checked_in: { label: "Đã check-in", color: "teal", icon: CheckCircle2 },
  completed: { label: "Đã khám", color: "green", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "red", icon: Clock },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? { label: status, color: "gray", icon: Clock };
}

// ---------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------
function useDoctorAppointments() {
  return useQuery({
    queryKey: ["doctor", "appointments"],
    queryFn: async () => {
      const { data } = await httpClient.get<{
        success: boolean;
        appointments: AppointmentForDoctor[];
      }>("/results/appointments");
      return data.appointments ?? [];
    },
  });
}

// ---------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------
function DoctorStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Group gap="md">
        <ThemeIcon color={color} size={48} radius="xl" variant="light">
          <Icon size={22} />
        </ThemeIcon>
        <Box>
          <Text
            size="xs"
            c="dimmed"
            fw={500}
            tt="uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            {label}
          </Text>
          <Text size="xl" fw={800} c="dark.8">
            {value}
          </Text>
        </Box>
      </Group>
    </Card>
  );
}

// ---------------------------------------------------------------
// Appointment row
// ---------------------------------------------------------------
function AppointmentRow({ appt }: { appt: AppointmentForDoctor }) {
  const cfg = getStatusConfig(appt.status);
  const StatusIcon = cfg.icon;
  const name = appt.profiles?.fullname ?? "Bệnh nhân";
  const phone = appt.profiles?.phone ?? "";
  const time = appt.slot_id
    ? appt.slot_id.substring(0, 5)
    : (appt.appointment_time?.substring(0, 5) ?? "--:--");

  return (
    <Group
      justify="space-between"
      p="sm"
      style={{
        borderRadius: 12,
        border: "1px solid var(--mantine-color-gray-2)",
        background: "rgba(255,255,255,0.7)",
      }}
    >
      <Group gap="sm">
        <Avatar color="blue" radius="xl" size="md">
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Text fw={700} size="sm" c="dark.8">
            {name}
          </Text>
          <Text size="xs" c="dimmed">
            {phone} · {time}
          </Text>
        </Box>
      </Group>
      <Badge
        color={cfg.color}
        radius="sm"
        variant="light"
        leftSection={<StatusIcon size={12} />}
      >
        {cfg.label}
      </Badge>
    </Group>
  );
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------
export function DoctorDashboardPage() {
  const { displayName } = useAuthSession();
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useDoctorAppointments();

  const todayStr = dayjs().format("YYYY-MM-DD");
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === todayStr,
  );

  const checkedIn = todayAppointments.filter(
    (a) => a.status === "checked_in",
  ).length;
  const completed = todayAppointments.filter(
    (a) => a.status === "completed",
  ).length;
  const totalToday = todayAppointments.length;

  const stats = [
    {
      icon: Users,
      label: "Bệnh nhân hôm nay",
      value: String(totalToday),
      color: "blue",
    },
    {
      icon: CheckCircle2,
      label: "Đã check-in",
      value: String(checkedIn),
      color: "teal",
    },
    {
      icon: Activity,
      label: "Đã khám xong",
      value: String(completed),
      color: "green",
    },
    {
      icon: Stethoscope,
      label: "Còn chờ khám",
      value: String(totalToday - completed),
      color: "orange",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        description={`Xin chào, ${displayName}. Dưới đây là danh sách bệnh nhân của bạn hôm nay.`}
        eyebrow="Doctor Dashboard"
        title="Bảng điều khiển Bác sĩ"
      />

      {isError && (
        <Alert color="red" radius="md" variant="light" mb="md">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </Alert>
      )}

      {/* Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md" mb="xl">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={100} radius="lg" />
            ))
          : stats.map((s) => <DoctorStatCard key={s.label} {...s} />)}
      </SimpleGrid>

      {/* Appointment queue */}
      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{ borderColor: "var(--mantine-color-gray-2)" }}
      >
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="blue" size={36} radius="xl" variant="light">
              <CalendarClock size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg" c="dark.8">
                Danh sách bệnh nhân hôm nay
              </Text>
              <Text size="xs" c="dimmed">
                {dayjs().format("DD/MM/YYYY")}
              </Text>
            </Box>
          </Group>

          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={68} radius="md" />
              ))}
            </Stack>
          ) : todayAppointments.length === 0 ? (
            <Box py="xl" style={{ textAlign: "center" }}>
              <ThemeIcon
                color="gray"
                size={56}
                radius="xl"
                variant="light"
                mx="auto"
                mb="md"
              >
                <Stethoscope size={28} />
              </ThemeIcon>
              <Text c="dimmed" size="sm">
                Hôm nay chưa có lịch khám nào được phân công.
              </Text>
            </Box>
          ) : (
            <Stack gap="sm">
              {todayAppointments.map((appt) => (
                <AppointmentRow key={appt.id} appt={appt} />
              ))}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Upcoming (other days) */}
      {!isLoading &&
        appointments.filter((a) => a.appointment_date > todayStr).length >
          0 && (
          <Card
            withBorder
            radius="lg"
            p="lg"
            mt="md"
            style={{ borderColor: "var(--mantine-color-gray-2)" }}
          >
            <Stack gap="md">
              <Text fw={700} size="lg" c="dark.8">
                Lịch sắp tới
              </Text>
              <Stack gap="sm">
                {appointments
                  .filter((a) => a.appointment_date > todayStr)
                  .slice(0, 5)
                  .map((appt) => (
                    <AppointmentRow key={appt.id} appt={appt} />
                  ))}
              </Stack>
            </Stack>
          </Card>
        )}
    </PageContainer>
  );
}
