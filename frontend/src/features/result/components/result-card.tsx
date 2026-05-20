import { useState } from "react";
import { ChevronDown, ChevronUp, Download, FileText, Calendar } from "lucide-react";
import { MedicalResult } from "../types";
import { useDownloadResult } from "../hooks/use-results";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/cn";

interface ResultCardProps {
  result: MedicalResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { download, isDownloading } = useDownloadResult();

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md",
        isExpanded && "ring-1 ring-primary/20"
      )}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        aria-controls={`result-detail-${result.id}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{result.diagnosis}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(result.appointmentDate).toLocaleDateString('vi-VN')}</span>
              <span>•</span>
              <span>BS. {result.doctorName}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </button>

      {/* Expandable Detail */}
      <div
        id={`result-detail-${result.id}`}
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t bg-muted/30 p-5 space-y-6">
            {/* Indicators Grid */}
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {result.indicators.map((item, idx) => (
                <div key={idx} className="rounded-lg border bg-background p-3 shadow-sm">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{item.label}</dt>
                  <dd className="mt-1 font-bold text-lg text-foreground">
                    {item.value} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* Conclusion */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Kết luận từ bác sĩ</h4>
              <p className="text-sm leading-relaxed text-foreground/90 italic">
                "{result.conclusion}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => download(result.id, result.appointmentDate)}
                disabled={isDownloading === result.id}
                className="gap-2"
              >
                <Download className={cn("h-4 w-4", isDownloading === result.id && "animate-bounce")} />
                {isDownloading === result.id ? "Đang xử lý..." : "Tải kết quả PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}