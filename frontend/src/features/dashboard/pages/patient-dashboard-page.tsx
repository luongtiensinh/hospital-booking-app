import {
  Activity,
  CalendarClock,
  CircleDollarSign,
  FlaskConical,
  QrCode,
} from "lucide-react";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { NextAppointmentCard } from "@/features/dashboard/components/next-appointment-card";
import { ResultHighlightCard } from "@/features/dashboard/components/result-highlight-card";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { PatientQrCard } from "@/features/qr/components/patient-qr-card";
import { useLatestPatientQr } from "@/features/qr/hooks/use-latest-patient-qr";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Alert } from "@/shared/ui/alert";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatCurrency } from "@/shared/utils/formatters";

export function PatientDashboardPage() {
  const { data, isLoading, isError } = useDashboardOverview();
  const latestQrQuery = useLatestPatientQr();

  return (
    <PageContainer>
      <PageHeader
        description="Theo doi nhanh lich kham sap toi, QR gan nhat, ket qua xet nghiem va chi phi can luu y trong cung mot dashboard."
        eyebrow="Patient Overview"
        title="Tong quan cham soc y te"
      />

      {isError ? (
        <Alert className="border-danger/20 bg-danger/5 text-danger">
          Khong the tai dashboard tu API. Hay kiem tra backend hoac dang nhap lai neu phien da het han.
        </Alert>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-40" key={index} />
            ))
          : [
              {
                icon: CalendarClock,
                label: "Lich kham sap toi",
                value: String(data.upcomingCount),
                helper: "Bao gom cac lich da xac nhan va chua check-in.",
              },
              {
                icon: Activity,
                label: "Luot kham hoan tat",
                value: String(data.completedCount),
                helper: "Dung de theo doi tien trinh dieu tri theo tung giai doan.",
              },
              {
                icon: FlaskConical,
                label: "Ket qua chua doc",
                value: String(data.unreadResultsCount),
                helper: "Nhung xet nghiem moi co the can ban xem lai ngay.",
              },
              {
                icon: CircleDollarSign,
                label: "Chi phi cho xu ly",
                value: formatCurrency(data.billingOutstanding),
                helper: "Tong hoa don dang o trang thai pending hoac overdue.",
              },
            ].map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="section-grid">
        <div className="xl:col-span-5">
          {isLoading ? (
            <Skeleton className="h-[280px]" />
          ) : data?.nextAppointment ? (
            <NextAppointmentCard appointment={data.nextAppointment} />
          ) : (
            <EmptyState
              description="Khi co lich hen moi, ban se thay thong tin bac si, thoi gian va dia diem hien thi tai day."
              icon={CalendarClock}
              title="Chua co lich kham sap toi"
            />
          )}
        </div>

        <div className="xl:col-span-3">
          {latestQrQuery.isLoading ? (
            <Skeleton className="h-[280px]" />
          ) : latestQrQuery.data ? (
            <PatientQrCard
              isRefreshing={latestQrQuery.isFetching}
              onRefresh={() => void latestQrQuery.refetch()}
              qr={latestQrQuery.data}
            />
          ) : (
            <EmptyState
              description="Khi co lich kham da xac nhan, QR gan nhat se duoc hien thi tai day."
              icon={QrCode}
              title="Chua co QR gan nhat"
            />
          )}
        </div>

        <div className="xl:col-span-4">
          <Card className="h-full">
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Ket qua moi nhat</h2>
                <p className="text-sm text-muted-foreground">
                  Cac ket qua xet nghiem vua duoc bac si cap nhat gan day.
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
              ) : data && data.recentResults.length > 0 ? (
                <div className="grid gap-4">
                  {data.recentResults.map((result) => (
                    <ResultHighlightCard item={result} key={result.id} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="Ket qua xet nghiem moi se xuat hien tai day ngay khi bac si xac nhan va phat hanh."
                  icon={FlaskConical}
                  title="Chua co ket qua de hien thi"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
