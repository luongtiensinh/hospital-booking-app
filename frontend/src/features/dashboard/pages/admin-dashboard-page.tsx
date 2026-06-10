import { useState, useMemo } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Layers,
  TrendingUp,
  Search,
  Check,
  XCircle,
  Clock,
  RefreshCcw,
  Calendar,
  Filter,
  X,
} from "lucide-react";

import {
  Alert,
  Avatar,
  ActionIcon,
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
  TextInput,
  Button,
  Tooltip,
  Select,
  Divider,
} from "@mantine/core";
import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/shared/services/http-client";
import { appointmentsService } from "@/features/appointment/services/appointments-service";
import { CancelAppointmentDialog } from "@/features/appointment/components/cancel-appointment-dialog";
import { toast } from "sonner";
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
  appointmentAt?: string;
  profiles?: { fullname: string; phone: string } | null;
  counters?: { name: string; room: string } | null;
  counterName?: string;
  counterRoom?: string;
};

// ---------------------------------------------------------------
// Hook to fetch admin appointments
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
// Redesigned Stat card
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
        borderColor: "var(--mantine-color-gray-1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="hover:-translate-y-0.5 hover:shadow-md"
    >
      <Box
        style={{
          position: "absolute",
          top: -10,
          right: -10,
          opacity: 0.04,
          color: `var(--mantine-color-${color}-6)`,
        }}
      >
        <Icon size={96} />
      </Box>
      <Stack gap={6}>
        <Group justify="space-between" align="center">
          <Text
            size="xs"
            c="dimmed"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            {label}
          </Text>
          <ThemeIcon color={color} size={38} radius="lg" variant="light">
            <Icon size={18} />
          </ThemeIcon>
        </Group>
        <Text size="2.2rem" fw={900} c="dark.8" lh={1.1}>
          {value}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed" fw={500}>
            {subtitle}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

const STATUS_BADGE: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  confirmed: { label: "Đã xác nhận", color: "blue", icon: Clock },
  "checked-in": { label: "Đã check-in", color: "teal", icon: Activity },
  completed: { label: "Đã khám", color: "green", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "red", icon: XCircle },
  expired: { label: "Đã hết hạn", color: "gray", icon: XCircle },
};

// ---------------------------------------------------------------
// Mobile appointment card
// ---------------------------------------------------------------
function AppointmentMobileCard({
  appt,
  onCheckIn,
  onCancel,
  isCheckingIn,
}: {
  appt: Appointment;
  onCheckIn: (id: string) => void;
  onCancel: (appt: Appointment) => void;
  isCheckingIn: boolean;
}) {
  const badge = STATUS_BADGE[appt.status] ?? {
    label: appt.status,
    color: "gray",
    icon: Clock,
  };
  const StatusIcon = badge.icon;
  const patientName = appt.profiles?.fullname ?? "Bệnh nhân";
  const patientPhone = appt.profiles?.phone ?? "Không có SĐT";
  const counterName = appt.counterName || appt.counters?.name || "Khám bệnh";
  const counterRoom = appt.counterRoom || appt.counters?.room || "Phòng khám";
  const time = appt.slot_id?.substring(0, 5) || "—";
  const date = dayjs(appt.appointment_date).format("DD/MM/YYYY");
  const shortCode = appt.id.substring(0, 8).toUpperCase();

  return (
    <Card
      withBorder
      radius="lg"
      p="md"
      style={{
        borderColor: "var(--mantine-color-gray-2)",
        backgroundColor: "var(--mantine-color-white)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
      }}
    >
      {/* Header: Name & Avatar + Status Badge */}
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Avatar
            size="md"
            radius="xl"
            color="blue"
            variant="light"
            style={{ flexShrink: 0 }}
          >
            {patientName.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={750} c="dark.8" truncate>
              {patientName}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {patientPhone}
            </Text>
          </Box>
        </Group>
        <Badge
          color={badge.color}
          variant="light"
          radius="sm"
          size="sm"
          leftSection={<StatusIcon size={10} />}
          style={{ flexShrink: 0 }}
        >
          {badge.label}
        </Badge>
      </Group>

      <Divider my="xs" style={{ opacity: 0.6 }} />

      {/* Info Rows */}
      <Stack gap="xs" my="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text
              size="10px"
              c="dimmed"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Dịch vụ &amp; Phòng
            </Text>
            <Text size="xs" fw={600} c="blue.8" lineClamp={1}>
              {counterName}
            </Text>
            <Text size="10px" c="dimmed">
              {counterRoom}
            </Text>
          </Box>
          <Box style={{ textAlign: "right", flexShrink: 0 }}>
            <Text
              size="10px"
              c="dimmed"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Mã Check-in
            </Text>
            <Badge
              variant="outline"
              color="gray"
              radius="sm"
              size="xs"
              mt={2}
              style={{ fontFamily: "monospace", fontSize: "11px" }}
            >
              {shortCode}
            </Badge>
          </Box>
        </Group>

        <Box>
          <Text
            size="10px"
            c="dimmed"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            Thời gian hẹn
          </Text>
          <Text size="xs" fw={600} c="dark.7">
            {time} — ngày {date}
          </Text>
        </Box>
      </Stack>

      {/* Action buttons */}
      {appt.status === "confirmed" && (
        <Group gap="xs" grow mt="md">
          <Button
            size="xs"
            color="teal"
            variant="light"
            radius="md"
            leftSection={<Check size={13} />}
            loading={isCheckingIn}
            onClick={() => onCheckIn(appt.id)}
          >
            Check-in
          </Button>
          <Button
            size="xs"
            color="red"
            variant="light"
            radius="md"
            leftSection={<XCircle size={13} />}
            onClick={() => onCancel(appt)}
          >
            Hủy lịch
          </Button>
        </Group>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------
export function AdminDashboardPage() {
  const { displayName } = useAuthSession();
  const queryClient = useQueryClient();
  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useAdminAppointments();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

  // Cancellation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<{
    id: string;
    counterName: string;
    appointmentAt: string;
  } | null>(null);

  const todayStr = dayjs().format("YYYY-MM-DD");

  // Stat calculations
  const todayTotal = appointments.filter(
    (a) => a.appointment_date === todayStr,
  ).length;
  const totalAll = appointments.length;
  const completedAll = appointments.filter(
    (a) => a.status === "completed",
  ).length;
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
      label: "Chờ check-in",
      value: String(confirmedAll),
      subtitle: "Lịch hẹn chưa quét mã",
      color: "orange",
    },
  ];

  // Check-in manual mutation
  const checkInMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.checkInAppointment(id),
    onSuccess: () => {
      toast.success("Check-in bệnh nhân thành công.");
      queryClient.invalidateQueries({ queryKey: ["admin", "appointments"] });
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.message || "Không thể check-in bệnh nhân.";
      toast.error(errMsg);
    },
  });

  // Filter & Search appointments
  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appt) => {
        // 1. Date filter
        if (filterDate && appt.appointment_date !== filterDate) return false;

        // 2. Status filter
        if (statusFilter !== "all" && appt.status !== statusFilter)
          return false;

        // 3. Search query
        const patientName =
          appt.profiles?.fullname?.toLowerCase() || "bệnh nhân";
        const patientPhone = appt.profiles?.phone || "";
        const counterName = (
          appt.counterName ||
          appt.counters?.name ||
          ""
        ).toLowerCase();
        const shortCode = appt.id.substring(0, 8).toLowerCase();
        const query = search.toLowerCase();

        return (
          patientName.includes(query) ||
          patientPhone.includes(query) ||
          counterName.includes(query) ||
          shortCode.includes(query)
        );
      }),
    [appointments, filterDate, statusFilter, search],
  );

  const hasActiveFilter = !!search || !!filterDate || statusFilter !== "all";
  const handleClearFilters = () => {
    setSearch("");
    setFilterDate("");
    setStatusFilter("all");
  };

  const handleCancelClick = (appt: Appointment) => {
    setSelectedAppt({
      id: appt.id,
      counterName: appt.counterName || appt.counters?.name || "Quầy khám",
      appointmentAt: appt.appointmentAt || "",
    });
    setCancelModalOpen(true);
  };

  return (
    <PageContainer>
      <PageHeader
        description={`Xin chào, ${displayName}. Đây là trung tâm điều hành toàn viện.`}
        eyebrow="Admin Dashboard"
        title="Quản trị hệ thống"
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
              <Skeleton key={i} height={120} radius="lg" />
            ))
          : stats.map((s) => <AdminStatCard key={s.label} {...s} />)}
      </SimpleGrid>

      {/* Queue control table */}
      <Card
        withBorder
        radius="lg"
        p={{ base: "md", sm: "lg" }}
        style={{
          borderColor: "var(--mantine-color-gray-1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
        }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon color="blue" size={36} radius="xl" variant="light">
                <Layers size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="lg" c="dark.8">
                  Danh sách tiếp đón &amp; quản lý lịch hẹn
                </Text>
                <Text size="xs" c="dimmed">
                  Tìm kiếm, check-in hoặc hủy lịch nhanh cho bệnh nhân
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
              Làm mới
            </Button>
          </Group>

          {/* Search & Filter controls */}
          <Box
            p="md"
            mt="xs"
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
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: "0.06em" }}
              >
                Bộ lọc
              </Text>
              {hasActiveFilter && (
                <Button
                  size="compact-xs"
                  variant="light"
                  color="red"
                  leftSection={<X size={11} />}
                  onClick={handleClearFilters}
                  radius="md"
                  ml="auto"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <TextInput
                placeholder="Tên, SĐT, quầy, mã check-in..."
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
                    color: filterDate
                      ? "var(--mantine-color-dark-8)"
                      : "var(--mantine-color-gray-5)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {filterDate && (
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    color="gray"
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    onClick={() => setFilterDate("")}
                  >
                    <X size={12} />
                  </ActionIcon>
                )}
              </Box>

              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v ?? "all")}
                data={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Chờ khám", value: "confirmed" },
                  { label: "Đã check-in", value: "checked-in" },
                  { label: "Đã khám xong", value: "completed" },
                  { label: "Đã hủy", value: "cancelled" },
                  { label: "Đã hết hạn", value: "expired" },
                ]}
                radius="md"
                size="sm"
                checkIconPosition="right"
              />
            </SimpleGrid>
          </Box>

          {!isLoading && (
            <Group gap="xs">
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
            </Group>
          )}

          {isLoading ? (
            <Stack gap="xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={60} radius="md" />
              ))}
            </Stack>
          ) : filteredAppointments.length === 0 ? (
            <Box py="xl" style={{ textAlign: "center" }}>
              <Text c="dimmed" size="sm">
                Không tìm thấy lịch hẹn nào phù hợp.
              </Text>
            </Box>
          ) : (
            <>
              {/* ── Mobile: card list ── */}
              <Stack gap="sm" hiddenFrom="sm">
                {filteredAppointments.map((appt) => (
                  <AppointmentMobileCard
                    key={appt.id}
                    appt={appt}
                    onCheckIn={(id) => checkInMutation.mutate(id)}
                    onCancel={handleCancelClick}
                    isCheckingIn={
                      checkInMutation.isPending &&
                      checkInMutation.variables === appt.id
                    }
                  />
                ))}
              </Stack>

              {/* ── Desktop: table ── */}
              <ScrollArea visibleFrom="sm">
                <Table
                  highlightOnHover
                  verticalSpacing="md"
                  style={{ minWidth: 700 }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Bệnh nhân</Table.Th>
                      <Table.Th>Dịch vụ / Quầy khám</Table.Th>
                      <Table.Th>Thời gian khám</Table.Th>
                      <Table.Th>Mã Check-in</Table.Th>
                      <Table.Th>Trạng thái</Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Thao tác nhanh
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredAppointments.map((appt) => {
                      const badge = STATUS_BADGE[appt.status] ?? {
                        label: appt.status,
                        color: "gray",
                        icon: Clock,
                      };
                      const StatusIcon = badge.icon;
                      const patientName =
                        appt.profiles?.fullname ?? "Bệnh nhân";
                      const patientPhone =
                        appt.profiles?.phone ?? "Không có SĐT";
                      const counterName =
                        appt.counterName || appt.counters?.name || "Khám bệnh";
                      const counterRoom =
                        appt.counterRoom || appt.counters?.room || "Phòng khám";

                      const time = appt.slot_id?.substring(0, 5) || "—";
                      const date = dayjs(appt.appointment_date).format(
                        "DD/MM/YYYY",
                      );
                      const shortCode = appt.id.substring(0, 8).toUpperCase();
                      const isToday = appt.appointment_date === todayStr;

                      return (
                        <Table.Tr
                          key={appt.id}
                          style={{
                            background: isToday
                              ? "rgba(219,234,254,0.4)"
                              : undefined,
                          }}
                        >
                          {/* 1. Patient details */}
                          <Table.Td>
                            <Group gap="xs">
                              <Avatar
                                size="md"
                                radius="xl"
                                color="blue"
                                variant="light"
                              >
                                {patientName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Text size="sm" fw={700} c="dark.8">
                                  {patientName}
                                </Text>
                                {isToday && (
                                  <Badge
                                    size="xs"
                                    color="blue"
                                    variant="dot"
                                    radius="sm"
                                  >
                                    Hôm nay
                                  </Badge>
                                )}
                                <Text size="xs" c="dimmed">
                                  {patientPhone}
                                </Text>
                              </Box>
                            </Group>
                          </Table.Td>

                          {/* 2. Medical service / Counter */}
                          <Table.Td>
                            <Box>
                              <Text size="sm" fw={600} c="blue.8">
                                {counterName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {counterRoom}
                              </Text>
                            </Box>
                          </Table.Td>

                          {/* 3. Appointment Date & Time */}
                          <Table.Td>
                            <Box>
                              <Text size="sm" fw={600}>
                                {time}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {date}
                              </Text>
                            </Box>
                          </Table.Td>

                          {/* 4. Short code */}
                          <Table.Td>
                            <Badge
                              variant="outline"
                              color="gray"
                              radius="sm"
                              size="sm"
                            >
                              {shortCode}
                            </Badge>
                          </Table.Td>

                          {/* 5. Status Badge */}
                          <Table.Td>
                            <Badge
                              color={badge.color}
                              variant="light"
                              radius="sm"
                              leftSection={<StatusIcon size={12} />}
                            >
                              {badge.label}
                            </Badge>
                          </Table.Td>

                          {/* 6. Quick Action buttons */}
                          <Table.Td>
                            <Group gap="xs" justify="flex-end">
                              {appt.status === "confirmed" && (
                                <Tooltip label="Check-in trực tiếp">
                                  <Button
                                    size="xs"
                                    color="teal"
                                    variant="light"
                                    radius="md"
                                    leftSection={<Check size={14} />}
                                    loading={
                                      checkInMutation.isPending &&
                                      checkInMutation.variables === appt.id
                                    }
                                    onClick={() =>
                                      checkInMutation.mutate(appt.id)
                                    }
                                  >
                                    Check-in
                                  </Button>
                                </Tooltip>
                              )}

                              {appt.status === "confirmed" && (
                                <Tooltip label="Hủy lịch hẹn">
                                  <Button
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    radius="md"
                                    leftSection={<XCircle size={14} />}
                                    onClick={() => handleCancelClick(appt)}
                                  >
                                    Hủy lịch
                                  </Button>
                                </Tooltip>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </>
          )}
        </Stack>
      </Card>

      {/* Cancel Appointment Dialog */}
      {cancelModalOpen && selectedAppt && (
        <CancelAppointmentDialog
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedAppt(null);
            void refetch();
          }}
          appointmentId={selectedAppt.id}
          counterName={selectedAppt.counterName}
          appointmentAt={selectedAppt.appointmentAt}
        />
      )}
    </PageContainer>
  );
}
