import { useState } from "react";
import {
  History,
  LayoutList,
  Search,
  Activity,
  Check,
  XCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Alert,
  Box,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  Table,
  Badge,
  Avatar,
  Button,
  Tooltip,
  Select,
  SimpleGrid,
} from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { UpcomingAppointmentCard } from "@/features/appointment/components/upcoming-appointment-card";
import { appointmentsService } from "@/features/appointment/services/appointments-service";
import type { AppointmentStatus } from "@/features/appointment/types/appointment.types";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { CancelAppointmentDialog } from "@/features/appointment/components/cancel-appointment-dialog";
import { toast } from "sonner";
import dayjs from "dayjs";

const STATUS_BADGE: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  confirmed: { label: "Đã xác nhận", color: "blue", icon: Clock },
  "checked-in": { label: "Đã check-in", color: "teal", icon: Activity },
  completed: { label: "Đã khám", color: "green", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "red", icon: XCircle },
};

export function AppointmentHistoryPage() {
  const { role } = useAuthSession();
  const isAdmin = role === "admin";
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AppointmentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [counterFilter, setCounterFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  // Cancel dialog states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<{
    id: string;
    counterName: string;
    appointmentAt: string;
  } | null>(null);

  const historyQuery = useQuery({
    queryKey: ["appointments", "history"],
    queryFn: () => appointmentsService.getAppointmentHistory(),
  });

  const countersQuery = useQuery({
    queryKey: ["counters"],
    queryFn: () => appointmentsService.getCounters(),
    enabled: isAdmin,
  });

  // Check-in manual mutation
  const checkInMutation = useMutation({
    mutationFn: (id: string) => appointmentsService.checkInAppointment(id),
    onSuccess: () => {
      toast.success("Check-in bệnh nhân thành công.");
      queryClient.invalidateQueries({ queryKey: ["appointments", "history"] });
    },
    onError: (err: any) => {
      const errMsg =
        err?.response?.data?.message || "Không thể thực hiện check-in.";
      toast.error(errMsg);
    },
  });

  const handleCancelClick = (appt: any) => {
    setSelectedAppt({
      id: appt.id,
      counterName: appt.counterName || "Quầy khám",
      appointmentAt: appt.appointmentAt || "",
    });
    setCancelModalOpen(true);
  };

  // Filter logic
  const filteredAppointments = historyQuery.data?.filter((appt) => {
    // 1. Status tab filter
    const matchTab = activeTab === "all" || appt.status === activeTab;
    if (!matchTab) return false;

    // 2. Date filter
    if (dateFilter) {
      const apptDate = dayjs(appt.appointmentAt).format("YYYY-MM-DD");
      if (apptDate !== dateFilter) return false;
    }

    // 3. Counter filter
    if (counterFilter !== "all" && appt.counterName !== counterFilter) {
      return false;
    }

    // 4. Search query
    const patientName = appt.profiles?.fullname?.toLowerCase() || "";
    const patientPhone = appt.profiles?.phone || "";
    const counterName = appt.counterName.toLowerCase();
    const shortCode = appt.id.substring(0, 8).toLowerCase();
    const query = search.toLowerCase();

    return (
      patientName.includes(query) ||
      patientPhone.includes(query) ||
      counterName.includes(query) ||
      shortCode.includes(query)
    );
  });

  // Admin View
  if (isAdmin) {
    const counterSelectData = [
      { value: "all", label: "Tất cả các quầy" },
      ...(countersQuery.data?.map((c) => ({ value: c.name, label: c.name })) ||
        []),
    ];

    return (
      <PageContainer>
        <PageHeader
          description="Quản lý, tìm kiếm và tra cứu toàn bộ lịch sử hẹn khám trên hệ thống."
          eyebrow="Admin"
          title="Quản lý lịch hẹn hệ thống"
        />

        <Stack gap="lg" mt="md">
          <Box
            p="lg"
            bg="white"
            style={{
              borderRadius: "var(--mantine-radius-lg)",
              border: "1px solid var(--mantine-color-gray-1)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
            }}
          >
            <Group justify="space-between" align="center" mb="md" wrap="wrap">
              <Group gap="xs">
                <History size={20} color="var(--mantine-color-blue-6)" />
                <Title order={3} size="h4">
                  Danh sách quản lý lịch hẹn
                </Title>
              </Group>

              <TextInput
                placeholder="Tìm tên, SĐT, quầy, mã..."
                leftSection={<Search size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ width: 280 }}
                radius="md"
              />
            </Group>

            {/* Admin filters */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="lg">
              <Select
                label="Lọc theo quầy khám"
                placeholder="Chọn quầy khám"
                data={counterSelectData}
                value={counterFilter}
                onChange={(val) => setCounterFilter(val || "all")}
                radius="md"
              />

              <div>
                <Text size="xs" fw={500} mb={3} c="dark.6">
                  Lọc theo ngày khám
                </Text>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--mantine-color-gray-3)",
                    fontSize: "14px",
                    color: "var(--mantine-color-gray-8)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <Text size="xs" fw={500} mb={3} c="dark.6">
                  Trạng thái lịch hẹn
                </Text>
                <SegmentedControl
                  value={activeTab}
                  onChange={(val) =>
                    setActiveTab(val as AppointmentStatus | "all")
                  }
                  data={[
                    { label: "Tất cả", value: "all" },
                    { label: "Chờ khám", value: "confirmed" },
                    { label: "Check-in", value: "checked-in" },
                    { label: "Đã khám", value: "completed" },
                    { label: "Đã hủy", value: "cancelled" },
                  ]}
                  color="blue"
                  radius="md"
                  fullWidth
                />
              </div>
            </SimpleGrid>

            {historyQuery.isError && (
              <Alert color="red" radius="md" variant="light" mb="md">
                Lỗi tải lịch hẹn hệ thống. Vui lòng thử lại.
              </Alert>
            )}

            {historyQuery.isLoading ? (
              <Stack gap="xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height={60} radius="md" />
                ))}
              </Stack>
            ) : filteredAppointments && filteredAppointments.length > 0 ? (
              <Table
                highlightOnHover
                verticalSpacing="md"
                style={{ minWidth: 800 }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Bệnh nhân</Table.Th>
                    <Table.Th>Dịch vụ / Quầy khám</Table.Th>
                    <Table.Th>Ngày giờ khám</Table.Th>
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
                    const patientName = appt.profiles?.fullname ?? "Bệnh nhân";
                    const patientPhone = appt.profiles?.phone ?? "Không có SĐT";

                    const time = appt.appointmentAt
                      ? dayjs(appt.appointmentAt).format("HH:mm")
                      : "—";
                    const date = appt.appointmentAt
                      ? dayjs(appt.appointmentAt).format("DD/MM/YYYY")
                      : "—";
                    const shortCode = appt.id.substring(0, 8).toUpperCase();

                    return (
                      <Table.Tr key={appt.id}>
                        {/* 1. Patient */}
                        <Table.Td>
                          <Group gap="xs">
                            <Avatar size="sm" radius="xl" color="blue">
                              {patientName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={700}>
                                {patientName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {patientPhone}
                              </Text>
                            </Box>
                          </Group>
                        </Table.Td>

                        {/* 2. Counter / Service */}
                        <Table.Td>
                          <Box>
                            <Text size="sm" fw={600} c="blue.8">
                              {appt.counterName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Phòng: {appt.counterRoom}
                            </Text>
                          </Box>
                        </Table.Td>

                        {/* 3. Date & Time */}
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

                        {/* 4. Short check-in code */}
                        <Table.Td>
                          <Badge variant="outline" color="gray" radius="sm">
                            {shortCode}
                          </Badge>
                        </Table.Td>

                        {/* 5. Status */}
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

                        {/* 6. Actions */}
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
            ) : (
              <EmptyState
                icon={LayoutList}
                title="Không tìm thấy lịch hẹn"
                description="Không có lịch hẹn nào khớp với bộ lọc hiện tại của bạn."
              />
            )}
          </Box>
        </Stack>

        {/* Cancel Appointment Dialog */}
        {cancelModalOpen && selectedAppt && (
          <CancelAppointmentDialog
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedAppt(null);
              queryClient.invalidateQueries({
                queryKey: ["appointments", "history"],
              });
            }}
            appointmentId={selectedAppt.id}
            counterName={selectedAppt.counterName}
            appointmentAt={selectedAppt.appointmentAt}
          />
        )}
      </PageContainer>
    );
  }

  // Patient View
  return (
    <PageContainer>
      <PageHeader
        description="Theo dõi toàn bộ lịch sử khám bệnh và trạng thái lịch hẹn của bạn."
        eyebrow="History"
        title="Lịch sử khám"
      />

      <Stack gap="lg" mt="md">
        <Box
          p="md"
          bg="white"
          style={{
            borderRadius: "var(--mantine-radius-lg)",
            border: "1px solid var(--mantine-color-gray-2)",
          }}
        >
          <Group justify="space-between" align="center" mb="md">
            <Group gap="xs">
              <History size={20} color="var(--mantine-color-sky-6)" />
              <Title order={3} size="h4">
                Danh sách lịch hẹn
              </Title>
            </Group>

            <TextInput
              placeholder="Tìm theo quầy..."
              leftSection={<Search size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ width: 300 }}
              radius="md"
            />
          </Group>

          <SegmentedControl
            value={activeTab}
            onChange={(val) => setActiveTab(val as AppointmentStatus | "all")}
            data={[
              { label: "Tất cả", value: "all" },
              { label: "Đã xác nhận", value: "confirmed" },
              { label: "Đã khám", value: "completed" },
              { label: "Đã hủy", value: "cancelled" },
            ]}
            color="sky"
            radius="md"
            fullWidth
            mb="xl"
          />

          {historyQuery.isError && (
            <Alert color="red" radius="md" variant="light" mb="md">
              Lỗi tải lịch sử khám. Vui lòng thử lại.
            </Alert>
          )}

          {historyQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton height={140} radius="lg" />
              <Skeleton height={140} radius="lg" />
              <Skeleton height={140} radius="lg" />
            </div>
          ) : filteredAppointments && filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((appointment) => (
                <UpcomingAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={LayoutList}
              title="Không tìm thấy lịch sử"
              description="Không có lịch hẹn nào phù hợp với bộ lọc hiện tại của bạn."
            />
          )}
        </Box>
      </Stack>
    </PageContainer>
  );
}
