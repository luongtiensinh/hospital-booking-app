import { FileDown } from "lucide-react";

import { formatCurrency, formatDate } from "@/shared/utils/formatters";
import type { InvoiceSummary } from "@/features/invoice/types/invoice.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

type InvoiceCardProps = {
  invoice: InvoiceSummary;
};

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{invoice.serviceName}</h3>
            <p className="text-sm text-muted-foreground">
              Mã hóa đơn: {invoice.invoiceNumber}
            </p>
          </div>
          <StatusBadge label={invoice.statusLabel} status={invoice.status} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-secondary/70 p-4">
            <p className="text-sm font-medium text-secondary-foreground">Ngày phát hành</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDate(invoice.issuedAt)}
            </p>
          </div>
          <div className="rounded-2xl bg-secondary/70 p-4">
            <p className="text-sm font-medium text-secondary-foreground">Tổng chi phí</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(invoice.totalAmount)}
            </p>
          </div>
        </div>

        {invoice.pdfUrl ? (
          <Button asChild size="sm" variant="outline">
            <a href={invoice.pdfUrl} rel="noreferrer" target="_blank">
              <FileDown className="mr-2 h-4 w-4" />
              Tải hóa đơn PDF
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
