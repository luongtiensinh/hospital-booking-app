import { Camera, RotateCcw, ScanLine } from "lucide-react";

import type {
  CameraPermissionState,
  ScanLifecycleState,
} from "@/features/qr/types/qr.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

type QrScannerPanelProps = {
  containerId: string;
  permission: CameraPermissionState;
  status: ScanLifecycleState;
  isActive: boolean;
  onStart: () => void;
  onRetry: () => void;
};

export function QrScannerPanel({
  containerId,
  permission,
  status,
  isActive,
  onStart,
  onRetry,
}: QrScannerPanelProps) {
  const description =
    permission === "denied"
      ? "Camera da bi tu choi. Hay cap quyen roi thu lai."
      : status === "verifying"
        ? "Dang xac thuc QR voi server."
        : "Huong camera vao QR de he thong verify va chong duplicate.";

  return (
    <Card className="h-full">
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Scan QR bang camera</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-border bg-slate-950">
          <div
            className="flex min-h-[320px] items-center justify-center text-white"
            id={containerId}
          >
            {!isActive ? (
              <div className="space-y-3 px-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Camera className="h-7 w-7" />
                </div>
                <p className="text-sm text-white/75">
                  {permission === "denied"
                    ? "Khong the truy cap camera."
                    : "San sang mo camera de quet QR."}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            disabled={isActive || status === "verifying"}
            onClick={onStart}
            type="button"
          >
            <ScanLine className="mr-2 h-4 w-4" />
            {isActive ? "Dang quet..." : "Bat dau quet"}
          </Button>

          <Button className="flex-1" onClick={onRetry} type="button" variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Thu lai
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
