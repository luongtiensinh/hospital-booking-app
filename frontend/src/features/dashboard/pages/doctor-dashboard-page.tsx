import { useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock,
  Stethoscope,
  Users,
  Search,
  ClipboardList,
  Check,
  RefreshCcw,
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
  TextInput,
  SegmentedControl,
  Button,
  Tooltip,
  Select,
  Divider,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/shared/services/http-client";
import { appointmentsService } from "@/features/appointment/services/appointments-service";
import { EnterResultModal } from "@/features/result/pages/medical-results-page";
import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { toast } from "sonner";
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
  notes: string | null;
  profiles: {
    fullname: string;
    phone: string;
  } | null;
  counterName?: string;
  counterRoom?: string;
  counters?: {
    name: string;
    room: string;
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
  "checked-in": { label: "Đang chờ khám", color: "teal", icon: Activity },
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
    queryKey: ["results", "appointments"],
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
      style={{
        borderColor: "var(--mantine-color-gray-1)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      }}
    >
      <Group gap="md">
        <ThemeIcon color={color} size={48} radius="xl" variant="light">
          <Icon size={22} />
        </ThemeIcon>
        <Box>
          <Text
            size="xs"
            c="dimmed"
            fw={600}
            tt="uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            {label}
          </Text>
          <Text size="xl" fw={850} c="dark.8">
            {value}
          </Text>
        </Box>
      </Group>
    </Card>
  );
}

// ---------------------------------------------------------------
// Mobile appointment card for doctor
// ---------------------------------------------------------------
function DoctorAppointmentCard({
  appt,
  onCheckIn,
  onEnterResult,
  isCheckingIn,
}: {
  appt: AppointmentForDoctor;
  onCheckIn: (id: string) => void;
  onEnterResult: (appt: AppointmentForDoctor) => void;
  isCheckingIn: boolean;
}) {
  const cfg = getStatusConfig(appt.status);
  const StatusIcon = cfg.icon;
  const name = appt.profiles?.fullname ?? "Bệnh nhân";
  const phone = appt.profiles?.phone ?? "Không có SĐT";
  const time = appt.slot_id
    ? appt.slot_id.substring(0, 5)
    : (appt.appointment_time?.substring(0, 5) ?? "--:--");
  const date = dayjs(appt.appointment_date).format("DD/MM/YYYY");
  const shortCode = appt.id.substring(0, 8).toUpperCase();
  const counterName = appt.counterName || appt.counters?.name || "Khám bệnh";
  const counterRoom = appt.counterRoom || appt.counters?.room || "Phòng khám";

  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Avatar color="blue" radius="xl" size="md" style={{ flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ minWidth: 0 }}>
            <Text fw={750} size="sm" c="dark.8" truncate>
              {name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {phone}
            </Text>
          </Box>
        </Group>
        <Badge
          color={cfg.color}
          radius="sm"
          variant="light"
          size="sm"
          leftSection={<StatusIcon size={10} />}
          style={{ flexShrink: 0 }}
        >
          {cfg.label}
        </Badge>
      </Group>

      <Divider my="xs" />

      <SimpleGrid cols={2} spacing="xs" mb="sm">
        <Box>
          <Text size="10px" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
            Dịch vụ
          </Text>
          <Text size="xs" fw={600} c="blue.7" lineClamp={1}>
            {counterName}
          </Text>
          <Text size="10px" c="dimmed">{counterRoom}</Text>
        </Box>
        <Box>
          <Text size="10px" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
            Thời gian
          </Text>
          <Text size="xs" fw={600}>{time} — {date}</Text>
        </Box>
        <Box>
          <Text size="10px" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: "0.05em" }}>
            Mã khám
          </Text>
          <Text size="xs" fw={700} style={{ fontFamily: "monospace", color: "var(--mantine-color-gray-6)" }}>
            {shortCode}
          </Text>
        </Box>
      </SimpleGrid>

      {(appt.status === "confirmed" || appt.status === "checked-in") && (
        <Group gap="xs" grow mt="xs">
          {appt.status === "confirmed" && (
            <Button
              size="xs"
              variant="light"
              color="teal"
              radius="md"
              leftSection={<Check size={13} />}
              loading={isCheckingIn}
              onClick={() => onCheckIn(appt.id)}
            >
              Check-in
            </Button>
          )}
          <Button
            size="xs"
            radius="md"
            color="blue"
            leftSection={<ClipboardList size={13} />}
            onClick={() => onEnterResult(appt)}
          >
            Khám &amp; Nhập KQ
          </Button>
        </Group>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------
export function DoctorDashboardPage() {
  const { displayName } = useAuthSession();
  const queryClient = useQueryClient();
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useDoctorAppointments();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [search, setSearch] = useState("");
  const [activeQueueTab, setActiveQueueTab] = useState<string>("checked-in");

  // Diagnostics Modal State
  const [resultModalOpened, { open: openResultModal, close: closeResultModal }] = useDisclosure(false);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentForDoctor | null>(null);

  const todayStr = dayjs().format("YYYY-MM-DD");
  
  // Stats calculations based on today
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === todayStr,
  );
  const checkedInToday = todayAppointments.filter(
    (a) => a.status === "checked-in",
  ).length;
  const completedToday = todayAppointments.filter(
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
      icon: Activity,
      label: "Đang chờ khám",
      value: String(checkedInToday),
      color: "teal",
    },
    {
      icon: CheckCircle2,
      label: "Đã khám xong",
      value: String(completedToday),
      color: "green",
    },
    {
      icon: Stethoscope,
      label: "Chưa check-in",
      value: String(totalToday - checkedInToday - completedToday),
      color: "orange",
    },
  ];

  // Manual Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.checkInAppointment(id),
    onSuccess: () => {
      toast.success("Check-in bệnh nhân thành công.");
      queryClient.invalidateQueries({ queryKey: ["results", "appointments"] });
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || "Không thể thực hiện check-in.";
      toast.error(errMsg);
    },
  });

  // Filter & Search appointments
  const filteredAppointments = todayAppointments.filter((appt) => {
    // 1. Queue Tab Filter
    if (activeQueueTab !== "all" && appt.status !== activeQueueTab) {
      return false;
    }

    // 2. Search Query (Name, Phone, or Code)
    const patientName = appt.profiles?.fullname?.toLowerCase() || "";
    const patientPhone = appt.profiles?.phone || "";
    const shortCode = appt.id.substring(0, 8).toLowerCase();
    const query = search.toLowerCase();

    return (
      patientName.includes(query) ||
      patientPhone.includes(query) ||
      shortCode.includes(query)
    );
  });

  const handleEnterResultClick = (appt: AppointmentForDoctor) => {
    setSelectedAppt(appt);
    openResultModal();
  };

  return (
    <PageContainer>
      <PageHeader
        description={`Xin chào, Bác sĩ ${displayName}. Dưới đây là danh sách bệnh nhân và hàng đợi phòng khám.`}
        eyebrow="Doctor Dashboard"
        title="Bảng điều khiển Bác sĩ"
      />

      {isError && (
        <Alert color="red" radius="md" variant="light" mb="md">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </Alert>
      )}

      {/* Stats */}
      <SimpleGrid cols={{ base: 2, sm: 2, xl: 4 }} spacing="md" mb="xl">
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
        p={{ base: "md", sm: "lg" }}
        style={{ borderColor: "var(--mantine-color-gray-1)", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon color="blue" size={36} radius="xl" variant="light">
                <CalendarClock size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="lg" c="dark.8">
                  Hàng đợi bệnh nhân phòng khám
                </Text>
                <Text size="xs" c="dimmed">
                  Quản lý danh sách khám và nhập kết quả bệnh án
                </Text>
              </Box>
            </Group>

            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<RefreshCcw size={14} />}
              onClick={() => void refetch()}
            >
              Làm mới hàng đợi
            </Button>
          </Group>

          {/* Search & Tabs — responsive */}
          <Stack gap="sm" mt="xs">
            <TextInput
              placeholder="Tìm bệnh nhân bằng tên, SĐT, mã check-in..."
              leftSection={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              radius="md"
            />

            {/* Queue tab filter — Select on mobile, SegmentedControl on desktop */}
            {isMobile ? (
              <Select
                value={activeQueueTab}
                onChange={(v) => setActiveQueueTab(v ?? "checked-in")}
                data={[
                  { label: "Đang chờ khám", value: "checked-in" },
                  { label: "Chờ check-in", value: "confirmed" },
                  { label: "Đã khám xong", value: "completed" },
                  { label: "Tất cả", value: "all" },
                ]}
                radius="md"
                size="sm"
                checkIconPosition="right"
              />
            ) : (
              <SegmentedControl
                value={activeQueueTab}
                onChange={setActiveQueueTab}
                data={[
                  { label: "Đang chờ khám", value: "checked-in" },
                  { label: "Chờ check-in", value: "confirmed" },
                  { label: "Đã khám xong", value: "completed" },
                  { label: "Tất cả", value: "all" },
                ]}
                color="teal"
                radius="md"
              />
            )}
          </Stack>

          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={80} radius="md" />
              ))}
            </Stack>
          ) : filteredAppointments.length === 0 ? (
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
                Không có bệnh nhân nào trong hàng đợi này.
              </Text>
            </Box>
          ) : isMobile ? (
            /* ── Mobile: card list ── */
            <Stack gap="sm">
              {filteredAppointments.map((appt) => (
                <DoctorAppointmentCard
                  key={appt.id}
                  appt={appt}
                  onCheckIn={(id) => checkInMutation.mutate(id)}
                  onEnterResult={handleEnterResultClick}
                  isCheckingIn={
                    checkInMutation.isPending && checkInMutation.variables === appt.id
                  }
                />
              ))}
            </Stack>
          ) : (
            /* ── Desktop: existing row layout ── */
            <Stack gap="sm">
              {filteredAppointments.map((appt) => {
                const cfg = getStatusConfig(appt.status);
                const StatusIcon = cfg.icon;
                const name = appt.profiles?.fullname ?? "Bệnh nhân";
                const phone = appt.profiles?.phone ?? "Không có SĐT";
                const time = appt.slot_id
                  ? appt.slot_id.substring(0, 5)
                  : (appt.appointment_time?.substring(0, 5) ?? "--:--");
                const date = dayjs(appt.appointment_date).format("DD/MM/YYYY");
                const shortCode = appt.id.substring(0, 8).toUpperCase();
                const counterName = appt.counterName || appt.counters?.name || "Khám bệnh";
                const counterRoom = appt.counterRoom || appt.counters?.room || "Phòng khám";

                return (
                  <Group
                    key={appt.id}
                    justify="space-between"
                    p="md"
                    style={{
                      borderRadius: 12,
                      border: "1px solid var(--mantine-color-gray-1)",
                      background: "rgba(255,255,255,0.7)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
                    }}
                  >
                    <Group gap="md">
                      <Avatar color="blue" radius="xl" size="md">
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        {/* 1. Patient Name & Phone */}
                        <Group gap="xs" align="center">
                          <Text fw={750} size="sm" c="dark.8">
                            {name}
                          </Text>
                          <Text size="xs" c="dimmed" fw={500}>
                            · {phone}
                          </Text>
                        </Group>

                        {/* 2. Medical Service & Room */}
                        <Text size="xs" fw={600} c="blue.7" mt={1}>
                          Dịch vụ: {counterName} ({counterRoom})
                        </Text>

                        {/* 3. Appointment Date & Time & Short Code */}
                        <Text size="xs" c="dimmed" mt={1}>
                          Thời gian: <span style={{ fontWeight: 600 }}>{time}</span> ngày {date} · <span style={{ fontWeight: 700, color: "var(--mantine-color-gray-6)" }}>Mã khám: {shortCode}</span>
                        </Text>
                      </Box>
                    </Group>

                    <Group gap="sm">
                      <Badge
                        color={cfg.color}
                        radius="sm"
                        variant="light"
                        leftSection={<StatusIcon size={12} />}
                      >
                        {cfg.label}
                      </Badge>

                      {/* 4. Actions */}
                      {appt.status === "confirmed" && (
                        <Tooltip label="Check-in trực tiếp tại phòng khám">
                          <Button
                            size="xs"
                            variant="light"
                            color="teal"
                            radius="md"
                            leftSection={<Check size={14} />}
                            loading={checkInMutation.isPending && checkInMutation.variables === appt.id}
                            onClick={() => checkInMutation.mutate(appt.id)}
                          >
                            Check-in
                          </Button>
                        </Tooltip>
                      )}

                      {(appt.status === "checked-in" || appt.status === "confirmed") && (
                        <Button
                          size="xs"
                          radius="md"
                          color="blue"
                          leftSection={<ClipboardList size={14} />}
                          onClick={() => handleEnterResultClick(appt)}
                        >
                          Khám &amp; Nhập KQ
                        </Button>
                      )}
                    </Group>
                  </Group>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Enter Result Modal */}
      {resultModalOpened && selectedAppt && (
        <EnterResultModal
          opened={resultModalOpened}
          onClose={closeResultModal}
          appointment={selectedAppt}
        />
      )}
    </PageContainer>
  );
}
