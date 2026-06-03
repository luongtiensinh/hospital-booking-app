import {
  Activity,
  CalendarClock,
  CircleDollarSign,
  FlaskConical,
  QrCode,
} from "lucide-react";

import {
  Alert,
  Card,
  Grid,
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
      <PageHeader
        description=""
        eyebrow="Patient Overview"
        title="Tổng quan chăm sóc y tế"
      />

      {isError ? (
        <Alert color="red" radius="md" variant="light">
          Không thể tải dashboard từ API. Hãy kiểm tra backend hoặc đăng nhập
          lại nếu phiên đã hết hạn.
        </Alert>
      ) : null}

      {/* Stat Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={160} radius="lg" />
            ))
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </SimpleGrid>

      {/* Main content grid */}
      <Grid>
        {/* Next appointment */}
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

        {/* Latest QR */}
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

        {/* Recent results */}
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Card
            radius="lg"
            withBorder
            h="100%"
            style={{ borderColor: "var(--mantine-color-gray-2)" }}
          >
            <Stack gap="md">
              <div>
                <Text fw={700} size="lg" c="dark.8">
                  Kết quả mới nhất
                </Text>
              </div>

              {isLoading ? (
                <Stack gap="sm">
                  <Skeleton height={112} radius="md" />
                  <Skeleton height={112} radius="md" />
                </Stack>
              ) : data && data.recentResults.length > 0 ? (
                <Stack gap="sm">
                  {data.recentResults.map((result) => (
                    <ResultHighlightCard item={result} key={result.id} />
                  ))}
                </Stack>
              ) : (
                <EmptyState
                  description="Kết quả xét nghiệm mới sẽ xuất hiện tại đây ngay khi bác sĩ xác nhận và phát hành."
                  icon={FlaskConical}
                  title="Chưa có kết quả để hiển thị"
                />
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
}
