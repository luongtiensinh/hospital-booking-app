import { QrCode, ScanLine, ShieldCheck } from "lucide-react";
import { useCallback, useEffect } from "react";

import {
  Alert,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { PatientQrCard } from "@/features/qr/components/patient-qr-card";
import { QrScannerPanel } from "@/features/qr/components/qr-scanner-panel";
import { QrVerifyResultCard } from "@/features/qr/components/qr-verify-result-card";
import { useLatestPatientQr } from "@/features/qr/hooks/use-latest-patient-qr";
import { useQrScanSession } from "@/features/qr/hooks/use-qr-scan-session";
import { useQrScanner } from "@/features/qr/hooks/use-qr-scanner";
import { useVerifyQr } from "@/features/qr/hooks/use-verify-qr";
import { EmptyState } from "@/shared/components/feedback/empty-state";

const scannerElementId = "qr-checkin-scanner";

// ---------------------------------------------------------------
// Patient view — chỉ hiển thị mã QR của bệnh nhân
// ---------------------------------------------------------------
function PatientQrView() {
  const latestQrQuery = useLatestPatientQr();

  return (
    <>
      <PageHeader
        description="Xuất trình mã QR này cho nhân viên tại quầy để check-in lịch khám."
        eyebrow="Mã QR của tôi"
        title="QR Check-in lịch khám"
      />

      {latestQrQuery.isError && (
        <Alert color="yellow" radius="md" variant="light" mb="lg">
          Không thể tải mã QR. Vui lòng thử lại.
        </Alert>
      )}

      <Grid>
        <Grid.Col span={{ base: 12, sm: 8, md: 6, xl: 5 }}>
          {latestQrQuery.isLoading ? (
            <Skeleton height={440} radius="xl" />
          ) : latestQrQuery.data ? (
            <PatientQrCard
              isRefreshing={latestQrQuery.isFetching}
              onRefresh={() => void latestQrQuery.refetch()}
              qr={latestQrQuery.data}
            />
          ) : (
            <EmptyState
              description="Khi có lịch khám đã xác nhận, mã QR check-in sẽ được tạo và hiển thị tại đây."
              icon={QrCode}
              title="Chưa có QR khả dụng"
            />
          )}
        </Grid.Col>

        {/* Hướng dẫn sử dụng */}
        <Grid.Col span={{ base: 12, sm: 4, md: 6, xl: 7 }}>
          <Card withBorder radius="xl" p="xl" h="100%">
            <Stack gap="lg">
              <Group gap="sm">
                <ThemeIcon color="blue" size={40} radius="xl" variant="light">
                  <QrCode size={18} />
                </ThemeIcon>
                <Box>
                  <Text fw={700} size="md" c="dark.8">
                    Hướng dẫn check-in
                  </Text>
                  <Text size="xs" c="dimmed">
                    Quy trình 3 bước đơn giản
                  </Text>
                </Box>
              </Group>

              {[
                {
                  step: "01",
                  title: "Đặt lịch khám",
                  desc: "Đặt lịch trước trên hệ thống và chờ xác nhận.",
                  color: "blue",
                },
                {
                  step: "02",
                  title: "Lưu mã QR",
                  desc: "Mã QR tự động sinh sau khi lịch được xác nhận.",
                  color: "teal",
                },
                {
                  step: "03",
                  title: "Check-in tại quầy",
                  desc: "Xuất trình mã cho nhân viên để hoàn tất check-in.",
                  color: "green",
                },
              ].map(({ step, title, desc, color }) => (
                <Group key={step} gap="md" align="flex-start">
                  <Badge
                    color={color}
                    variant="light"
                    size="lg"
                    radius="md"
                    style={{ minWidth: 36, fontWeight: 800 }}
                  >
                    {step}
                  </Badge>
                  <Box>
                    <Text fw={700} size="sm" c="dark.8">
                      {title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {desc}
                    </Text>
                  </Box>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------
// Staff view (doctor / admin) — chỉ hiển thị màn hình quét QR
// ---------------------------------------------------------------
function StaffQrScanView() {
  const verifyQrMutation = useVerifyQr();
  const { permission, status, lastProcessedValue, lastResult, resetScanState } =
    useQrScanSession();

  const handleDetected = useCallback(
    (value: string) => {
      if (value === lastProcessedValue) return;
      verifyQrMutation.mutate({ value });
    },
    [lastProcessedValue, verifyQrMutation],
  );

  const { isActive, startScanner } = useQrScanner({
    elementId: scannerElementId,
    onDetected: handleDetected,
  });

  // Auto-start camera when staff enters the page
  useEffect(() => {
    void startScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSubmit = useCallback(
    (value: string) => {
      if (value === lastProcessedValue) return;
      verifyQrMutation.mutate({ value });
    },
    [lastProcessedValue, verifyQrMutation],
  );

  const handleRetry = useCallback(() => {
    resetScanState();
    verifyQrMutation.reset();
    void startScanner();
  }, [resetScanState, startScanner, verifyQrMutation]);

  return (
    <>
      <PageHeader
        description="Scan mã QR của bệnh nhân để xác nhận check-in lịch hẹn."
        eyebrow="Nhân viên · Check-in"
        title="Quét QR bệnh nhân"
      />

      {verifyQrMutation.isError && (
        <Alert color="yellow" radius="md" variant="light" mb="lg">
          Không thể xác minh mã QR. Vui lòng thử lại.
        </Alert>
      )}

      <Grid>
        {/* Scanner */}
        <Grid.Col span={{ base: 12, md: 7, xl: 6 }}>
          <Stack gap="sm">
            <Group gap="sm">
              <ThemeIcon color="blue" size={36} radius="xl" variant="light">
                <ScanLine size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="md" c="dark.8">
                  Camera scan
                </Text>
                <Text size="xs" c="dimmed">
                  Hướng camera vào mã QR của bệnh nhân
                </Text>
              </Box>
            </Group>
            <QrScannerPanel
              containerId={scannerElementId}
              isActive={isActive}
              onRetry={handleRetry}
              onStart={() => void startScanner()}
              onManualSubmit={handleManualSubmit}
              permission={permission}
              status={status}
            />
          </Stack>
        </Grid.Col>

        {/* Verify result */}
        <Grid.Col span={{ base: 12, md: 5, xl: 6 }}>
          <Stack gap="sm">
            <Group gap="sm">
              <ThemeIcon color="teal" size={36} radius="xl" variant="light">
                <ShieldCheck size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="md" c="dark.8">
                  Kết quả xác nhận
                </Text>
                <Text size="xs" c="dimmed">
                  Trạng thái check-in và thông tin bệnh nhân
                </Text>
              </Box>
            </Group>
            <QrVerifyResultCard
              onRetry={handleRetry}
              result={lastResult}
              status={status}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}

// ---------------------------------------------------------------
// Page router — phân nhánh theo role
// ---------------------------------------------------------------
export function QrCheckInPage() {
  const { role } = useAuthSession();

  return (
    <PageContainer>
      {role === "patient" || !role ? (
        <PatientQrView />
      ) : (
        // doctor + admin → màn hình quét QR
        <StaffQrScanView />
      )}
    </PageContainer>
  );
}
