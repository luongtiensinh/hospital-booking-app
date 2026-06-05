import {
  Activity,
  CalendarClock,
  CircleDollarSign,
  FlaskConical,
  QrCode,
} from "lucide-react";

import {
  Alert,
  Box,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { NextAppointmentCard } from "@/features/dashboard/components/next-appointment-card";
import { ResultHighlightCard } from "@/features/dashboard/components/result-highlight-card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { PatientQrCard } from "@/features/qr/components/patient-qr-card";
import { useLatestPatientQr } from "@/features/qr/hooks/use-latest-patient-qr";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { HospitalLogo } from "@/shared/ui/hospital-logo";
import { formatCurrency } from "@/shared/utils/formatters";

export function PatientDashboardPage() {
  const { data, isLoading, isError } = useDashboardOverview();
  const latestQrQuery = useLatestPatientQr();

  const stats = data
    ? [
        {
          icon: CalendarClock,
          label: "Lịch khám sắp tới",
          value: String(data.upcomingCount),
        },
        {
          icon: Activity,
          label: "Lượt khám hoàn tất",
          value: String(data.completedCount),
        },
        {
          icon: FlaskConical,
          label: "Kết quả chưa đọc",
          value: String(data.unreadResultsCount),
          helper: "",
        },
        {
          icon: CircleDollarSign,
          label: "Chi phí chờ xử lý",
          value: formatCurrency(data.billingOutstanding),
        },
      ]
    : [];

  return (
    <PageContainer>
      <Box mb="xl">
        <Group justify="space-between" align="center" wrap="nowrap">
          <PageHeader
            description="Theo dõi lịch khám, kết quả cần đọc và các thông tin sức khỏe quan trọng tại một nơi."
            eyebrow="Xin chào"
            title="Cổng thông tin Bệnh nhân"
          />
        </Group>
      </Box>

      {isError ? (
        <Alert color="red" radius="md" variant="light">
          Không thể tải dashboard từ API. Hãy kiểm tra backend hoặc đăng nhập
          lại nếu phiên đã hết hạn.
        </Alert>
      ) : null}

      <SimpleGrid cols={{ base: 2, sm: 2, xl: 4 }} spacing="sm">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={80} radius="lg" />
            ))
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, xl: 5 }}>
          {isLoading ? (
            <Skeleton height={280} radius="lg" />
          ) : data?.nextAppointment ? (
            <NextAppointmentCard appointment={data.nextAppointment} />
          ) : (
            <EmptyState
              description="Khi có lịch hẹn mới, bạn sẽ thấy thông tin bác sĩ, thời gian và địa điểm hiển thị tại đây."
              icon={CalendarClock}
              title="Chưa có lịch khám sắp tới"
            />
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 3 }}>
          {latestQrQuery.isLoading ? (
            <Skeleton height={280} radius="lg" />
          ) : latestQrQuery.data ? (
            <PatientQrCard
              isRefreshing={latestQrQuery.isFetching}
              onRefresh={() => void latestQrQuery.refetch()}
              qr={latestQrQuery.data}
            />
          ) : (
            <EmptyState
              description="Khi có lịch khám đã xác nhận, QR gần nhất sẽ được hiển thị tại đây."
              icon={QrCode}
              title="Chưa có QR gần nhất"
            />
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 4 }}>
          {isLoading ? (
            <Skeleton height={280} radius="lg" />
          ) : data?.recentResults?.length ? (
            <Card radius="lg" withBorder p="lg">
              <Stack gap="md">
                <Text fw={700} size="sm">
                  Kết quả cần chú ý
                </Text>
                {data.recentResults.slice(0, 3).map((result) => (
                  <ResultHighlightCard key={result.id} item={result} />
                ))}
              </Stack>
            </Card>
          ) : (
            <EmptyState
              description="Các kết quả khám bệnh và chẩn đoán hình ảnh mới sẽ xuất hiện tại đây để bạn theo dõi."
              icon={FlaskConical}
              title="Chưa có kết quả mới"
            />
          )}
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
}
