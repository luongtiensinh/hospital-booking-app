import { FileDown } from "lucide-react";

import { formatDate } from "@/shared/utils/formatters";
import type { ResultSummary } from "@/features/result/types/result.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

type ResultHighlightCardProps = {
  item: ResultSummary;
};

export function ResultHighlightCard({ item }: ResultHighlightCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">{item.examName}</h3>
            <p className="text-sm text-muted-foreground">
              Bác sĩ {item.doctorName}
            </p>
          </div>
          <StatusBadge label={item.statusLabel} status={item.status} />
        </div>

        <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {formatDate(item.reportedAt)}
          </span>
          {item.pdfUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={item.pdfUrl} rel="noreferrer" target="_blank">
                <FileDown className="mr-2 h-4 w-4" />
                PDF
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
