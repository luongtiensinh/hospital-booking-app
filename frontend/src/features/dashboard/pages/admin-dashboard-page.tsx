import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Layers,
  TrendingUp,
} from "lucide-react";

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Card,
  Group,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
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
type Appointment = {
  id: string;
  patient_id: string;
  appointment_date: string;
  slot_id: string;
  status: string;
  doctor_name: string | null;
  specialty: string | null;
  profiles?: { fullname: string; phone: string } | null;
};

// ---------------------------------------------------------------
// Hook
// ---------------------------------------------------------------
function useAdminAppointments() {
  return useQuery({
    queryKey: ["admin", "appointments"],
    queryFn: async () => {
      const { data } = await httpClient.get<{
        success: boolean;
        appointments: Appointment[];
      }>("/appointments?upcoming=false");
      return data.appointments ?? [];
    },
  });
}

// ---------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------
function AdminStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      style={{
        borderColor: "var(--mantine-color-gray-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: -16,
          right: -16,
          opacity: 0.05,
        }}
      >
        <Icon size={100} />
      </Box>
      <Stack gap={4}>
        <Group gap="sm">
          <ThemeIcon color={color} size={40} radius="xl" variant="light">
            <Icon size={20} />
          </ThemeIcon>
          <Text
            size="xs"
            c="dimmed"
            fw={600}
            tt="uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            {label}
          </Text>
        </Group>
        <Text size="2rem" fw={900} c="dark.8" lh={1}>
          {value}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Đã xác nhận", color: "blue" },
  checked_in: { label: "Đã check-in", color: "teal" },
  completed: { label: "Đã khám", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------
export function AdminDashboardPage() {
  const { displayName } = useAuthSession();
  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useAdminAppointments();

  const todayStr = dayjs().format("YYYY-MM-DD");

  const todayTotal = appointments.filter(
    (a) => a.appointment_date === todayStr,
  ).length;
  const totalAll = appointments.length;
  const completedAll = appointments.filter(
    (a) => a.status === "completed",
  ).length;
  // const cancelledAll = appointments.filter(
  //   (a) => a.status === "cancelled",
  // ).length;
  const confirmedAll = appointments.filter(
    (a) => a.status === "confirmed",
  ).length;

  const stats = [
    {
      icon: CalendarDays,
      label: "Tổng lịch hẹn",
      value: String(totalAll),
      subtitle: "Toàn bộ hệ thống",
      color: "blue",
    },
    {
      icon: TrendingUp,
      label: "Lịch hẹn hôm nay",
      value: String(todayTotal),
      subtitle: dayjs().format("DD/MM/YYYY"),
      color: "violet",
    },
    {
      icon: CheckCircle2,
      label: "Đã khám xong",
      value: String(completedAll),
      subtitle: `${totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0}% tổng lịch`,
      color: "green",
    },
    {
      icon: Activity,
      label: "Đang chờ xác nhận",
      value: String(confirmedAll),
      subtitle: "Chưa check-in",
      color: "orange",
    },
  ];

  // Lấy 10 lịch hẹn gần nhất
  const recentAppointments = [...appointments]
    .sort((a, b) => (b.appointment_date > a.appointment_date ? 1 : -1))
    .slice(0, 10);

  return (
    <PageContainer>
      <PageHeader
        description={`Xin chào, ${displayName}. Đây là tổng quan toàn bộ hệ thống đặt lịch.`}
        eyebrow="Admin Dashboard"
        title="Quản trị hệ thống"
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
              <Skeleton key={i} height={120} radius="lg" />
            ))
          : stats.map((s) => <AdminStatCard key={s.label} {...s} />)}
      </SimpleGrid>

      {/* Recent appointments table */}
      <Card
        withBorder
        radius="lg"
        p="lg"
        style={{ borderColor: "var(--mantine-color-gray-2)" }}
      >
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="dark" size={36} radius="xl" variant="light">
              <Layers size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg" c="dark.8">
                Lịch hẹn gần đây
              </Text>
              <Text size="xs" c="dimmed">
                10 lịch hẹn mới nhất trong hệ thống
              </Text>
            </Box>
          </Group>

          {isLoading ? (
            <Stack gap="xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={52} radius="md" />
              ))}
            </Stack>
          ) : recentAppointments.length === 0 ? (
            <Box py="xl" style={{ textAlign: "center" }}>
              <Text c="dimmed">Chưa có lịch hẹn nào trong hệ thống.</Text>
            </Box>
          ) : (
            <ScrollArea>
              <Table
                highlightOnHover
                striped
                withTableBorder={false}
                verticalSpacing="sm"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Bệnh nhân</Table.Th>
                    <Table.Th>Bác sĩ</Table.Th>
                    <Table.Th>Ngày khám</Table.Th>
                    <Table.Th>Giờ</Table.Th>
                    <Table.Th>Trạng thái</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentAppointments.map((appt) => {
                    const badge = STATUS_BADGE[appt.status] ?? {
                      label: appt.status,
                      color: "gray",
                    };
                    return (
                      <Table.Tr key={appt.id}>
                        <Table.Td>
                          <Group gap="xs">
                            <Avatar size="sm" radius="xl" color="blue">
                              {(appt.profiles?.fullname ?? "B")
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={600}>
                                {appt.profiles?.fullname ?? "Bệnh nhân"}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {appt.profiles?.phone ?? ""}
                              </Text>
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{appt.doctor_name ?? "—"}</Text>
                          {appt.specialty && (
                            <Text size="xs" c="dimmed">
                              {appt.specialty}
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {dayjs(appt.appointment_date).format("DD/MM/YYYY")}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {appt.slot_id?.substring(0, 5) ?? "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={badge.color}
                            variant="light"
                            radius="sm"
                          >
                            {badge.label}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Stack>
      </Card>
    </PageContainer>
  );
}
