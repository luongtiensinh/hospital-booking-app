import { FlaskConical } from "lucide-react";

import { useResults } from "@/features/result/hooks/use-results";
import { ResultCard } from "@/features/result/components/result-card";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Alert } from "@/shared/ui/alert";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";

export function MedicalResultsPage() {
  const { data, isLoading, isError } = useResults();

  return (
    <PageContainer>
      <PageHeader
        description="Xem lịch sử xét nghiệm, phần tóm tắt từ bác sĩ và tải PDF từ server-side export khi backend đã sẵn sàng."
        eyebrow="Medical Results"
        title="Kết quả xét nghiệm"
      />

      {isError ? (
        <Alert className="border-warning/20 bg-warning/5 text-warning">
          Chưa thể tải dữ liệu kết quả xét nghiệm. Frontend đang chờ backend cung
          cấp endpoint `/medical-results`.
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="relative space-y-4 before:absolute before:left-6 before:top-0 before:h-full before:w-px before:bg-border lg:before:left-1/2">
          {data.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Các kết quả sau khi bác sĩ nhập và phát hành sẽ xuất hiện tại đây, kèm theo khả năng tải PDF."
          icon={FlaskConical}
          title="Chưa có kết quả xét nghiệm"
        />
      )}
    </PageContainer>
  );
}
