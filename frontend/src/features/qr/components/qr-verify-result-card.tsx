import { AlertTriangle, CheckCircle2, CopyCheck, RefreshCcw } from "lucide-react";

import { formatDateTime } from "@/shared/utils/formatters";
import type {
  ScanLifecycleState,
  VerifyQrResponse,
} from "@/features/qr/types/qr.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

type QrVerifyResultCardProps = {
  status: ScanLifecycleState;
  result: VerifyQrResponse | null;
  onRetry: () => void;
};

export function QrVerifyResultCard({
  status,
  result,
  onRetry,
}: QrVerifyResultCardProps) {
  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "duplicate"
        ? CopyCheck
        : AlertTriangle;

  const title =
    status === "success"
      ? "Check-in thanh cong"
      : status === "duplicate"
        ? "QR da duoc quet"
        : status === "invalid"
          ? "QR khong hop le"
          : status === "error"
            ? "Khong the xu ly"
            : "San sang scan";

  return (
    <Card className="h-full">
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Ket qua verify</h3>
          <p className="text-sm text-muted-foreground">
            Hien thi duplicate handling, invalid QR va thong tin appointment lien quan.
          </p>
        </div>

        <div className="rounded-[28px] border border-border bg-secondary/50 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">
                {result?.message ?? "Quet QR de xem phan hoi tu server."}
              </p>
            </div>
          </div>

          {result?.appointmentAt ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Benh nhan:</span>{" "}
                {result.patientName ?? "--"}
              </p>
              <p>
                <span className="font-medium text-foreground">Bac si:</span>{" "}
                {result.doctorName ?? "--"}
              </p>
              <p>
                <span className="font-medium text-foreground">Thoi gian:</span>{" "}
                {formatDateTime(result.appointmentAt)}
              </p>
              <p>
                <span className="font-medium text-foreground">Dia diem:</span>{" "}
                {result.location ?? "--"}
              </p>
              {result.checkedInAt ? (
                <p>
                  <span className="font-medium text-foreground">Da check-in:</span>{" "}
                  {formatDateTime(result.checkedInAt)}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <Button onClick={onRetry} type="button" variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Scan lai
        </Button>
      </CardContent>
    </Card>
  );
}
