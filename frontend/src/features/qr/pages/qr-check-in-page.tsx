import { QrCode, ShieldCheck } from "lucide-react";
import { useCallback } from "react";

import { Alert, Grid, Group, Stack, Text } from "@mantine/core";

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
import { Skeleton } from "@mantine/core";

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
        description="Trang QR gom patient dashboard card, camera scanner, verify result, duplicate handling và retry flow để phù hợp mobile-first check-in."
        eyebrow="QR Check-in"
        title="QR và scan camera"
      />

      {(latestQrQuery.isError || verifyQrMutation.isError) && (
        <Alert color="yellow" radius="md" variant="light">
          QR module không thể tải hoặc verify dữ liệu. Bạn có thể retry để tiếp tục.
        </Alert>
      )}

      <Grid gutter="md">
        {/* QR Card */}
        <Grid.Col span={{ base: 12, xl: 5 }}>
          <Stack gap="xs">
            <Group gap="sm">
              <QrCode size={18} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={700} size="md" c="dark.8">QR dashboard bệnh nhân</Text>
                <Text size="xs" c="dimmed">Hiển thị QR gần nhất, lịch khám sắp tới và trạng thái appointment.</Text>
              </div>
            </Group>

            {latestQrQuery.isLoading ? (
              <Skeleton height={420} radius="lg" />
            ) : latestQrQuery.data ? (
              <PatientQrCard
                isRefreshing={latestQrQuery.isFetching}
                onRefresh={() => void latestQrQuery.refetch()}
                qr={latestQrQuery.data}
              />
            ) : (
              <EmptyState
                description="Khi có lịch khám đã xác nhận, QR check-in gần nhất sẽ được hiển thị tại đây."
                icon={QrCode}
                title="Chưa có QR khả dụng"
              />
            )}
          </Stack>
        </Grid.Col>

        {/* Scanner */}
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Stack gap="xs">
            <Group gap="sm">
              <ShieldCheck size={18} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={700} size="md" c="dark.8">Scan QR</Text>
                <Text size="xs" c="dimmed">Hỗ trợ camera permission, loading state và verify duplicate.</Text>
              </div>
            </Group>
            <QrScannerPanel
              containerId={scannerElementId}
              isActive={isActive}
              onRetry={handleRetry}
              onStart={() => void startScanner()}
              permission={permission}
              status={status}
            />
          </Stack>
        </Grid.Col>

        {/* Verify result */}
        <Grid.Col span={{ base: 12, xl: 3 }}>
          <Stack gap="xs">
            <Group gap="sm">
              <ShieldCheck size={18} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={700} size="md" c="dark.8">Verify status</Text>
                <Text size="xs" c="dimmed">Toast, retry button và fallback UI cho invalid hoặc duplicate QR.</Text>
              </div>
            </Group>
            <QrVerifyResultCard
              onRetry={handleRetry}
              result={lastResult}
              status={status}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
}
