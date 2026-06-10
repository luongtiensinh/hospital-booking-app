import { useState, useMemo } from "react";
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
  Calendar,
  Filter,
  X,
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
  Button,
  Tooltip,
  Select,
  Divider,
  ActionIcon,
  Indicator,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/shared/services/http-client";
import { appointmentsService } from "@/features/appointment/services/appointments-service";
import { useRealtimeAppointments } from "@/features/appointment/hooks/use-realtime-appointments";
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
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  sub?: string;
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
          {sub && (
            <Text size="xs" c="dimmed" mt={2}>
              {sub}
            </Text>
          )}
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

  useRealtimeAppointments([["results", "appointments"]]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filter state
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [activeQueueTab, setActiveQueueTab] = useState<string>("all");

  // Diagnostics Modal State
  const [resultModalOpened, { open: openResultModal, close: closeResultModal }] = useDisclosure(false);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentForDoctor | null>(null);

  const todayStr = dayjs().format("YYYY-MM-DD");

  // ----------- Stats (all appointments) -----------
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const checkedInToday = todayAppointments.filter((a) => a.status === "checked-in").length;
  const completedToday = todayAppointments.filter((a) => a.status === "completed").length;
  const totalToday = todayAppointments.length;
  const totalAll = appointments.length;

  const stats = [
    {
      icon: Users,
      label: "Tổng lịch hẹn",
      value: String(totalAll),
      color: "blue",
      sub: `${totalToday} lịch hôm nay`,
    },
    {
      icon: Activity,
      label: "Đang chờ khám",
      value: String(checkedInToday),
      color: "teal",
      sub: "Hôm nay",
    },
    {
      icon: CheckCircle2,
      label: "Đã khám xong",
      value: String(completedToday),
      color: "green",
      sub: "Hôm nay",
    },
    {
      icon: Stethoscope,
      label: "Chưa check-in",
      value: String(totalToday - checkedInToday - completedToday),
      color: "orange",
      sub: "Hôm nay",
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

  // ----------- Filter logic -----------
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // 1. Status tab
      if (activeQueueTab !== "all" && appt.status !== activeQueueTab) return false;

      // 2. Date filter
      if (filterDate) {
        if (appt.appointment_date !== filterDate) return false;
      }

      // 3. Search (name, phone, or code)
      const patientName = appt.profiles?.fullname?.toLowerCase() || "";
      const patientPhone = appt.profiles?.phone || "";
      const shortCode = appt.id.substring(0, 8).toLowerCase();
      const query = search.toLowerCase().trim();

      if (query) {
        return (
          patientName.includes(query) ||
          patientPhone.includes(query) ||
          shortCode.includes(query)
        );
      }

      return true;
    });
  }, [appointments, activeQueueTab, filterDate, search]);

  const hasActiveFilter = !!search || !!filterDate || activeQueueTab !== "all";

  const handleClearFilters = () => {
    setSearch("");
    setFilterDate("");
    setActiveQueueTab("all");
  };

  const handleEnterResultClick = (appt: AppointmentForDoctor) => {
    setSelectedAppt(appt);
    openResultModal();
  };

  return (
    <PageContainer>
      <PageHeader
        description={`Xin chào, Bác sĩ ${displayName}.`}
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

      {/* Appointment list */}
      <Card
        withBorder
        radius="lg"
        p={{ base: "md", sm: "lg" }}
        style={{ borderColor: "var(--mantine-color-gray-1)", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}
      >
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon color="blue" size={36} radius="xl" variant="light">
                <CalendarClock size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="lg" c="dark.8">
                  Danh sách lịch hẹn
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              {hasActiveFilter && (
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<X size={14} />}
                  onClick={handleClearFilters}
                  radius="md"
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<RefreshCcw size={14} />}
                onClick={() => void refetch()}
              >
                Làm mới
              </Button>
            </Group>
          </Group>

          {/* ── Filter bar ── */}
          <Box
            p="md"
            style={{
              background: "var(--mantine-color-gray-0)",
              borderRadius: 12,
              border: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Group gap="xs" mb="sm" align="center">
              <ThemeIcon size="sm" color="gray" variant="transparent">
                <Filter size={14} />
              </ThemeIcon>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>
                Bộ lọc
              </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              {/* Search by name / phone / code */}
              <TextInput
                placeholder="Tên, số điện thoại, mã khám..."
                leftSection={<Search size={15} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                radius="md"
                size="sm"
                rightSection={
                  search ? (
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="gray"
                      onClick={() => setSearch("")}
                    >
                      <X size={12} />
                    </ActionIcon>
                  ) : undefined
                }
              />

              {/* Date picker — native input */}
              <Box style={{ position: "relative" }}>
                <Box
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    zIndex: 1,
                    color: "var(--mantine-color-gray-5)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Calendar size={15} />
                </Box>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: 36,
                    paddingLeft: 36,
                    paddingRight: filterDate ? 36 : 12,
                    paddingTop: 0,
                    paddingBottom: 0,
                    fontSize: "var(--mantine-font-size-sm)",
                    border: "1px solid var(--mantine-color-gray-4)",
                    borderRadius: 8,
                    outline: "none",
                    background: "var(--mantine-color-white)",
                    color: filterDate ? "var(--mantine-color-dark-8)" : "var(--mantine-color-gray-5)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {filterDate && (
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    color="gray"
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}
                    onClick={() => setFilterDate("")}
                  >
                    <X size={12} />
                  </ActionIcon>
                )}
              </Box>

              {/* Status filter — Select on mobile */}
              {isMobile ? (
                <Select
                  value={activeQueueTab}
                  onChange={(v) => setActiveQueueTab(v ?? "all")}
                  data={[
                    { label: "Tất cả trạng thái", value: "all" },
                    { label: "Đang chờ khám", value: "checked-in" },
                    { label: "Chờ check-in", value: "confirmed" },
                    { label: "Đã khám xong", value: "completed" },
                  ]}
                  radius="md"
                  size="sm"
                  checkIconPosition="right"
                />
              ) : (
                <Select
                  value={activeQueueTab}
                  onChange={(v) => setActiveQueueTab(v ?? "all")}
                  data={[
                    { label: "Tất cả trạng thái", value: "all" },
                    { label: "Đang chờ khám", value: "checked-in" },
                    { label: "Chờ check-in", value: "confirmed" },
                    { label: "Đã khám xong", value: "completed" },
                  ]}
                  radius="md"
                  size="sm"
                  checkIconPosition="right"
                />
              )}
            </SimpleGrid>
          </Box>

          {/* Result count */}
          {!isLoading && (
            <Group gap="xs">
              <Indicator color="blue" size={8} processing={isLoading}>
                <Text size="sm" c="dimmed">
                  Hiển thị{" "}
                  <Text span fw={700} c="dark.7">
                    {filteredAppointments.length}
                  </Text>{" "}
                  /{" "}
                  <Text span fw={600} c="dimmed">
                    {appointments.length}
                  </Text>{" "}
                  lịch hẹn
                </Text>
              </Indicator>
            </Group>
          )}

          {/* List */}
          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 5 }).map((_, i) => (
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
                Không tìm thấy lịch hẹn nào khớp với bộ lọc.
              </Text>
              {hasActiveFilter && (
                <Button
                  mt="sm"
                  size="xs"
                  variant="subtle"
                  color="blue"
                  onClick={handleClearFilters}
                >
                  Xóa bộ lọc
                </Button>
              )}
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
            /* ── Desktop: row layout ── */
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
                const isToday = appt.appointment_date === todayStr;

                return (
                  <Group
                    key={appt.id}
                    justify="space-between"
                    p="md"
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${isToday ? "var(--mantine-color-blue-2)" : "var(--mantine-color-gray-1)"}`,
                      background: isToday
                        ? "rgba(224,242,254,0.35)"
                        : "rgba(255,255,255,0.7)",
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
                          {isToday && (
                            <Badge size="xs" color="blue" variant="dot" radius="sm">
                              Hôm nay
                            </Badge>
                          )}
                        </Group>

                        {/* 2. Medical Service & Room */}
                        <Text size="xs" fw={600} c="blue.7" mt={1}>
                          Dịch vụ: {counterName} ({counterRoom})
                        </Text>

                        {/* 3. Appointment Date & Time & Short Code */}
                        <Text size="xs" c="dimmed" mt={1}>
                          Thời gian: <span style={{ fontWeight: 600 }}>{time}</span> ngày {date} ·{" "}
                          <span style={{ fontWeight: 700, color: "var(--mantine-color-gray-6)" }}>
                            Mã khám: {shortCode}
                          </span>
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
