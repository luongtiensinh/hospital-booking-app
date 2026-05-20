import { ReceiptText } from "lucide-react";

import { useInvoices } from "@/features/invoice/hooks/use-invoices";
import { InvoiceCard } from "@/features/invoice/components/invoice-card";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Alert } from "@/shared/ui/alert";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";

export function InvoicesPage() {
  const { data, isLoading, isError } = useInvoices();

  return (
    <PageContainer>
      <PageHeader
        description="Theo dõi chi phí theo từng lần khám, xem trạng thái thanh toán và mở rộng dễ dàng sang export PDF server-side."
        eyebrow="Billing"
        title="Hóa đơn y tế"
      />

      {isError ? (
        <Alert className="border-warning/20 bg-warning/5 text-warning">
          Chưa thể đồng bộ hóa đơn từ API. Frontend đang chờ endpoint `/invoices`
          từ backend.
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4">
          {data.map((invoice) => (
            <InvoiceCard invoice={invoice} key={invoice.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Khi hệ thống phát sinh hóa đơn cho mỗi lượt khám, danh sách sẽ hiển thị tại đây kèm trạng thái thanh toán."
          icon={ReceiptText}
          title="Chưa có hóa đơn"
        />
      )}
    </PageContainer>
  );
}
