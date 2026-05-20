import { QrCode, ShieldCheck } from "lucide-react";
import { useCallback } from "react";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { PatientQrCard } from "@/features/qr/components/patient-qr-card";
import { QrScannerPanel } from "@/features/qr/components/qr-scanner-panel";
import { QrVerifyResultCard } from "@/features/qr/components/qr-verify-result-card";
import { useLatestPatientQr } from "@/features/qr/hooks/use-latest-patient-qr";
import { useQrScanSession } from "@/features/qr/hooks/use-qr-scan-session";
import { useQrScanner } from "@/features/qr/hooks/use-qr-scanner";
import { useVerifyQr } from "@/features/qr/hooks/use-verify-qr";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Alert } from "@/shared/ui/alert";
import { Skeleton } from "@/shared/ui/skeleton";

const scannerElementId = "qr-checkin-scanner";

export function QrCheckInPage() {
  const latestQrQuery = useLatestPatientQr();
  const verifyQrMutation = useVerifyQr();
  const { permission, status, lastProcessedValue, lastResult, resetScanState } =
    useQrScanSession();

  const handleDetected = useCallback(
    (value: string) => {
      if (value === lastProcessedValue) {
        return;
      }

      verifyQrMutation.mutate({ value });
    },
    [lastProcessedValue, verifyQrMutation],
  );

  const { isActive, startScanner } = useQrScanner({
    elementId: scannerElementId,
    onDetected: handleDetected,
  });

  const handleRetry = useCallback(() => {
    resetScanState();
    verifyQrMutation.reset();
    void startScanner();
  }, [resetScanState, startScanner, verifyQrMutation]);

  return (
    <PageContainer>
      <PageHeader
        description="Trang QR gom patient dashboard card, camera scanner, verify result, duplicate handling va retry flow de phu hop mobile-first check-in."
        eyebrow="QR Check-in"
        title="QR va scan camera"
      />

      {(latestQrQuery.isError || verifyQrMutation.isError) && (
        <Alert className="border-warning/20 bg-warning/5 text-warning">
          QR module khong the tai hoac verify du lieu. Ban co the retry de tiep tuc.
        </Alert>
      )}

      <section className="section-grid">
        <div className="space-y-4 xl:col-span-5">
          <div className="flex items-center gap-3">
            <QrCode className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">QR dashboard benh nhan</h2>
              <p className="text-sm text-muted-foreground">
                Hien thi QR gan nhat, lich kham sap toi va trang thai appointment.
              </p>
            </div>
          </div>

          {latestQrQuery.isLoading ? (
            <Skeleton className="h-[420px]" />
          ) : latestQrQuery.data ? (
            <PatientQrCard
              isRefreshing={latestQrQuery.isFetching}
              onRefresh={() => void latestQrQuery.refetch()}
              qr={latestQrQuery.data}
            />
          ) : (
            <EmptyState
              description="Khi co lich kham da xac nhan, QR check-in gan nhat se duoc hien thi tai day."
              icon={QrCode}
              title="Chua co QR kha dung"
            />
          )}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Scan QR</h2>
              <p className="text-sm text-muted-foreground">
                Ho tro camera permission, loading state va verify duplicate.
              </p>
            </div>
          </div>

          <QrScannerPanel
            containerId={scannerElementId}
            isActive={isActive}
            onRetry={handleRetry}
            onStart={() => void startScanner()}
            permission={permission}
            status={status}
          />
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Verify status</h2>
              <p className="text-sm text-muted-foreground">
                Toast, retry button va fallback UI cho invalid hoac duplicate QR.
              </p>
            </div>
          </div>

          <QrVerifyResultCard
            onRetry={handleRetry}
            result={lastResult}
            status={status}
          />
        </div>
      </section>
    </PageContainer>
  );
}
