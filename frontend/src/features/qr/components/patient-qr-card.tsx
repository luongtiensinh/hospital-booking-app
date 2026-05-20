import { CalendarRange, Clock3, MapPin, RefreshCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { formatDateTime } from "@/shared/utils/formatters";
import type { LatestAppointmentQr } from "@/features/qr/types/qr.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { StatusBadge } from "@/shared/ui/status-badge";

type PatientQrCardProps = {
  qr: LatestAppointmentQr;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

export function PatientQrCard({
  qr,
  onRefresh,
  isRefreshing = false,
}: PatientQrCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">QR check-in gan nhat</h3>
            <p className="text-sm text-muted-foreground">
              Dua ma nay cho quay tiep nhan de check-in nhanh.
            </p>
          </div>
          <StatusBadge
            label={qr.appointmentStatusLabel}
            status={qr.appointmentStatus}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="flex items-center justify-center rounded-[28px] border border-border bg-white p-5">
            <QRCodeSVG
              bgColor="#ffffff"
              fgColor="#11314d"
              includeMargin
              size={180}
              value={qr.qrValue}
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-secondary/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <CalendarRange className="h-4 w-4" />
                Lich kham
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(qr.appointmentAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <Clock3 className="h-4 w-4" />
                Het han QR
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(qr.expiresAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <MapPin className="h-4 w-4" />
                Bac si va dia diem
              </div>
              <p className="text-sm text-muted-foreground">
                {qr.doctorName} • {qr.specialty} • {qr.location}
              </p>
            </div>
          </div>
        </div>

        {onRefresh ? (
          <Button
            disabled={isRefreshing}
            onClick={onRefresh}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefreshing ? "Dang lam moi..." : "Lam moi QR"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
