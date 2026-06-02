import { CalendarDays, History, LayoutList, Search, Activity } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Alert, Box, Group, SegmentedControl, Skeleton, Stack, Text, TextInput, Title } from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { UpcomingAppointmentCard } from "@/features/appointment/components/upcoming-appointment-card";
import { appointmentsService } from "@/features/appointment/services/appointments-service";
import type { AppointmentStatus } from "@/features/appointment/types/appointment.types";
import { EmptyState } from "@/shared/components/feedback/empty-state";

export function AppointmentHistoryPage() {
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "all">("all");
  const [search, setSearch] = useState("");

  const historyQuery = useQuery({
    queryKey: ["appointments", "history"],
    queryFn: () => appointmentsService.getAppointmentHistory(),
  });

  const filteredAppointments = historyQuery.data?.filter((appt) => {
    const matchTab = activeTab === "all" || appt.status === activeTab;
    const matchSearch = appt.counterName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <PageContainer>
      <PageHeader
        description="Theo dõi toàn bộ lịch sử khám bệnh và trạng thái lịch hẹn của bạn."
        eyebrow="History"
        title="Lịch sử khám"
      />

      <Stack gap="lg" mt="md">
        <Box p="md" bg="white" style={{ borderRadius: 'var(--mantine-radius-lg)', border: '1px solid var(--mantine-color-gray-2)' }}>
          <Group justify="space-between" align="center" mb="md">
            <Group gap="xs">
              <History size={20} color="var(--mantine-color-sky-6)" />
              <Title order={3} size="h4">Danh sách lịch hẹn</Title>
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
                <UpcomingAppointmentCard key={appointment.id} appointment={appointment} />
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
