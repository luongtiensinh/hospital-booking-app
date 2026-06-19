import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import {
  ClipboardList,
  FlaskConical,
  Plus,
  Save,
  X,
  Calendar,
  MapPin,
  User,
  Phone,
  FileText,
  FileDown,
  Stethoscope,
  Pencil,
} from "lucide-react";
import { useDisclosure } from "@mantine/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import dayjs from "dayjs";
import { generateResultPdf } from "@/shared/utils/generate-result-pdf";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import {
  resultApi,
  type BackendResult,
  type DoctorAppointment,
} from "@/features/result/api/result-api";

// ---------------------------------------------------------------
// Shared hooks
// ---------------------------------------------------------------
function useResults() {
  return useQuery({
    queryKey: ["results"],
    queryFn: () => resultApi.getAll().then((r) => r.data),
  });
}

function useDoctorAppointments(enabled: boolean) {
  return useQuery({
    queryKey: ["results", "appointments"],
    queryFn: resultApi.getDoctorAppointments,
    enabled,
  });
}

// ---------------------------------------------------------------
// Patient view — list own results
// ---------------------------------------------------------------
function PatientResultCard({
  result,
  onEdit,
}: {
  result: BackendResult;
  onEdit?: (result: BackendResult) => void;
}) {
  const { role } = useAuthSession();
  const isDoctorOrAdmin = role === "doctor" || role === "admin";
  const [downloading, setDownloading] = useState(false);

  const date = result.appointments?.appointment_date
    ? dayjs(result.appointments.appointment_date).format("DD/MM/YYYY")
    : "—";

  const patientName = result.appointments?.profiles?.fullname ?? "—";
  const patientPhone = result.appointments?.profiles?.phone ?? "—";
  const counterName = result.appointments?.counters?.name ?? "—";
  const counterRoom = result.appointments?.counters?.room ?? "—";

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await generateResultPdf(result);
      toast.success("Tải phiếu kết quả PDF thành công.");
    } catch {
      toast.error("Không thể tạo PDF. Vui lòng thử lại.");
    } finally {
      setDownloading(false);
    }
  }, [result]);

  return (
    <Card
      withBorder
      radius="xl"
      p="lg"
      style={{
        borderColor: "var(--mantine-color-gray-2)",
        background: "var(--mantine-color-white)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="center">
            <ThemeIcon color="blue" size={44} radius="xl" variant="light">
              <Stethoscope size={22} />
            </ThemeIcon>
            <Box>
              <Text fw={800} size="md" c="dark.8">
                {result.diagnosis ?? "Chẩn đoán chưa có"}
              </Text>
              <Group gap="xs" mt={2}>
                <Badge color="green" variant="light" size="sm" radius="md">
                  Đã có kết quả
                </Badge>
                <Text size="xs" c="dimmed">
                  Mã khám: #
                  {result.appointment_id.substring(0, 8).toUpperCase()}
                </Text>
              </Group>
            </Box>
          </Group>
          <Group gap="xs">
            {isDoctorOrAdmin && onEdit && (
              <Button
                variant="light"
                color="orange"
                size="xs"
                radius="md"
                leftSection={<Pencil size={14} />}
                onClick={() => onEdit(result)}
              >
                Sửa kết quả
              </Button>
            )}
            <Button
              variant="light"
              color="blue"
              size="xs"
              radius="md"
              leftSection={<FileDown size={14} />}
              onClick={handleDownload}
              loading={downloading}
            >
              Tải PDF
            </Button>
          </Group>
        </Group>

        <Divider color="gray.1" />

        {/* Metadata info */}
        <Grid gap="xs">
          {isDoctorOrAdmin && (
            <>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs" wrap="nowrap">
                  <User
                    size={14}
                    style={{ color: "var(--mantine-color-blue-5)" }}
                  />
                  <Text size="xs" fw={500} c="dark.7">
                    Bệnh nhân:{" "}
                    <Text span fw={700}>
                      {patientName}
                    </Text>
                  </Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="xs" wrap="nowrap">
                  <Phone
                    size={14}
                    style={{ color: "var(--mantine-color-blue-5)" }}
                  />
                  <Text size="xs" c="dimmed">
                    SĐT:{" "}
                    <Text span fw={600} c="dark.7">
                      {patientPhone}
                    </Text>
                  </Text>
                </Group>
              </Grid.Col>
            </>
          )}

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Group gap="xs" wrap="nowrap">
              <Calendar
                size={14}
                style={{ color: "var(--mantine-color-blue-5)" }}
              />
              <Text size="xs" c="dimmed">
                Ngày khám:{" "}
                <Text span fw={600} c="dark.7">
                  {date}
                </Text>
              </Text>
            </Group>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Group gap="xs" wrap="nowrap">
              <MapPin
                size={14}
                style={{ color: "var(--mantine-color-blue-5)" }}
              />
              <Text size="xs" c="dimmed">
                Phòng khám:{" "}
                <Text span fw={600} c="dark.7">
                  {counterName} ({counterRoom})
                </Text>
              </Text>
            </Group>
          </Grid.Col>
        </Grid>

        {/* Details section */}
        {result.result && (
          <Box
            p="sm"
            style={{
              background: "var(--mantine-color-gray-0)",
              borderRadius: "12px",
              borderLeft: "4px solid var(--mantine-color-blue-5)",
            }}
          >
            <Group gap="xs" mb={4}>
              <FileText
                size={14}
                style={{ color: "var(--mantine-color-gray-6)" }}
              />
              <Text size="xs" fw={700} c="gray.7">
                Kết luận & Hướng điều trị:
              </Text>
            </Group>
            <Text size="sm" c="dark.7" style={{ lineHeight: 1.5 }}>
              {result.result}
            </Text>
          </Box>
        )}
      </Stack>
    </Card>
  );
}

// ---------------------------------------------------------------
// Doctor / Admin: Enter result modal
// ---------------------------------------------------------------
export function EnterResultModal({
  opened,
  onClose,
  appointment,
}: {
  opened: boolean;
  onClose: () => void;
  appointment: DoctorAppointment | null;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [result, setResult] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: {
      appointmentId: string;
      diagnosis: string;
      result: string;
    }) => resultApi.createResult(payload),
    onSuccess: () => {
      toast.success("Đã lưu kết quả khám thành công.");
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["results", "appointments"] });
      setDiagnosis("");
      setResult("");
      onClose();
    },
    onError: () => {
      toast.error("Không thể lưu kết quả. Vui lòng thử lại.");
    },
  });

  const patientName = appointment?.profiles?.fullname ?? "Bệnh nhân";
  const time = appointment?.slot_id?.substring(0, 5) ?? "—";
  const date = appointment
    ? dayjs(appointment.appointment_date).format("DD/MM/YYYY")
    : "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="blue" size={32} radius="xl" variant="light">
            <ClipboardList size={16} />
          </ThemeIcon>
          <Text fw={700} size="md">
            Nhập kết quả khám
          </Text>
        </Group>
      }
      radius="lg"
      size="md"
      centered
    >
      <Stack gap="md">
        <Card withBorder radius="md" p="sm" bg="blue.0">
          <Text size="sm" fw={700} c="blue.8">
            {patientName}
          </Text>
          <Text size="xs" c="dimmed">
            {date} · {time} · {appointment?.profiles?.phone ?? ""}
          </Text>
        </Card>

        <Textarea
          label="Chẩn đoán"
          placeholder="VD: Viêm họng cấp / Theo dõi huyết áp..."
          required
          minRows={2}
          radius="md"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.currentTarget.value)}
        />

        <Textarea
          label="Kết luận / Ghi chú bác sĩ"
          placeholder="Kết luận chi tiết, hướng điều trị tiếp theo..."
          minRows={3}
          radius="md"
          value={result}
          onChange={(e) => setResult(e.currentTarget.value)}
        />

        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            radius="md"
            leftSection={<X size={14} />}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            radius="md"
            leftSection={<Save size={14} />}
            loading={mutation.isPending}
            disabled={!diagnosis.trim() || !appointment}
            onClick={() =>
              mutation.mutate({
                appointmentId: appointment?.id ?? "",
                diagnosis,
                result,
              })
            }
          >
            Lưu kết quả
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ---------------------------------------------------------------
// Doctor / Admin: Edit result modal
// ---------------------------------------------------------------
export function EditResultModal({
  opened,
  onClose,
  result,
}: {
  opened: boolean;
  onClose: () => void;
  result: BackendResult | null;
}) {
  const [diagnosis, setDiagnosis] = useState("");
  const [resultText, setResultText] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (result) {
      setDiagnosis(result.diagnosis ?? "");
      setResultText(result.result ?? "");
    } else {
      setDiagnosis("");
      setResultText("");
    }
  }, [result, opened]);

  const mutation = useMutation({
    mutationFn: (payload: { id: string; diagnosis: string; result: string }) =>
      resultApi.updateResult(payload.id, {
        diagnosis: payload.diagnosis,
        result: payload.result,
      }),
    onSuccess: () => {
      toast.success("Đã cập nhật kết quả khám thành công.");
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["results", "appointments"] });
      onClose();
    },
    onError: () => {
      toast.error("Không thể cập nhật kết quả. Vui lòng thử lại.");
    },
  });

  const patientName = result?.appointments?.profiles?.fullname ?? "Bệnh nhân";
  const date = result?.appointments?.appointment_date
    ? dayjs(result.appointments.appointment_date).format("DD/MM/YYYY")
    : "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="orange" size={32} radius="xl" variant="light">
            <Pencil size={16} />
          </ThemeIcon>
          <Text fw={700} size="md">
            Sửa kết quả khám
          </Text>
        </Group>
      }
      radius="lg"
      size="md"
      centered
    >
      <Stack gap="md">
        <Card withBorder radius="md" p="sm" bg="orange.0">
          <Text size="sm" fw={700} c="orange.8">
            {patientName}
          </Text>
          <Text size="xs" c="dimmed">
            {date} · {result?.appointments?.profiles?.phone ?? ""}
          </Text>
        </Card>

        <Textarea
          label="Chẩn đoán"
          placeholder="VD: Viêm họng cấp / Theo dõi huyết áp..."
          required
          minRows={2}
          radius="md"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.currentTarget.value)}
        />

        <Textarea
          label="Kết luận / Ghi chú bác sĩ"
          placeholder="Kết luận chi tiết, hướng điều trị tiếp theo..."
          minRows={3}
          radius="md"
          value={resultText}
          onChange={(e) => setResultText(e.currentTarget.value)}
        />

        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            radius="md"
            leftSection={<X size={14} />}
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            color="orange"
            radius="md"
            leftSection={<Save size={14} />}
            loading={mutation.isPending}
            disabled={!diagnosis.trim() || !result}
            onClick={() =>
              mutation.mutate({
                id: result?.id ?? "",
                diagnosis,
                result: resultText,
              })
            }
          >
            Lưu thay đổi
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ---------------------------------------------------------------
// Doctor / Admin appointment row
// ---------------------------------------------------------------
function DoctorAppointmentRow({
  appt,
  onEnterResult,
  onEditResult,
  correspondingResult,
}: {
  appt: DoctorAppointment;
  onEnterResult: (appt: DoctorAppointment) => void;
  onEditResult: (result: BackendResult) => void;
  correspondingResult?: BackendResult;
}) {
  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Đã xác nhận", color: "blue" },
    "checked-in": { label: "Đã check-in", color: "teal" },
    completed: { label: "Đã khám", color: "green" },
  };
  const badge = STATUS_LABEL[appt.status] ?? {
    label: appt.status,
    color: "gray",
  };
  const canEnterResult =
    appt.status === "checked-in" || appt.status === "confirmed";

  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        borderRadius: 12,
        border: "1px solid var(--mantine-color-gray-2)",
        background: "rgba(255,255,255,0.7)",
      }}
    >
      <Group gap="sm">
        <Avatar color="blue" radius="xl" size="md">
          {(appt.profiles?.fullname ?? "B").charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Text fw={700} size="sm" c="dark.8">
            {appt.profiles?.fullname ?? "Bệnh nhân"}
          </Text>
          <Text size="xs" c="dimmed">
            {appt.profiles?.phone ?? ""} ·{" "}
            {dayjs(appt.appointment_date).format("DD/MM/YYYY")} ·{" "}
            {appt.slot_id?.substring(0, 5) ?? "—"}
          </Text>
        </Box>
      </Group>
      <Group gap="sm">
        <Badge color={badge.color} variant="light" radius="sm">
          {badge.label}
        </Badge>
        {canEnterResult && (
          <Button
            size="xs"
            radius="md"
            leftSection={<Plus size={12} />}
            onClick={() => onEnterResult(appt)}
          >
            Nhập kết quả
          </Button>
        )}
        {appt.status === "completed" && correspondingResult && (
          <Button
            size="xs"
            color="orange"
            variant="light"
            radius="md"
            leftSection={<Pencil size={12} />}
            onClick={() => onEditResult(correspondingResult)}
          >
            Sửa kết quả
          </Button>
        )}
      </Group>
    </Group>
  );
}

// ---------------------------------------------------------------
// Main page
// ---------------------------------------------------------------
export function MedicalResultsPage() {
  const { role } = useAuthSession();
  const isDoctor = role === "doctor";
  const isAdmin = role === "admin";
  const isDoctorOrAdmin = isDoctor || isAdmin;

  const resultsQuery = useResults();
  const doctorApptQuery = useDoctorAppointments(isDoctorOrAdmin);

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [selectedAppt, setSelectedAppt] = useState<DoctorAppointment | null>(
    null,
  );

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedResult, setSelectedResult] = useState<BackendResult | null>(
    null,
  );

  const handleEnterResult = (appt: DoctorAppointment) => {
    setSelectedAppt(appt);
    openModal();
  };

  const handleEditResult = (result: BackendResult) => {
    setSelectedResult(result);
    openEditModal();
  };

  const pageDescription = isDoctorOrAdmin
    ? "Xem danh sách bệnh nhân và nhập kết quả khám."
    : "Xem lịch sử kết quả khám bệnh của bạn.";

  return (
    <PageContainer>
      <PageHeader
        description={pageDescription}
        eyebrow={isDoctorOrAdmin ? "Doctor / Admin" : "Medical Results"}
        title="Kết quả khám bệnh"
      />

      {/* Doctor / Admin: Appointment list để nhập kết quả */}
      {isDoctorOrAdmin && (
        <Card
          withBorder
          radius="lg"
          p="lg"
          mb="xl"
          style={{
            borderColor: "var(--mantine-color-blue-2)",
            background: "var(--mantine-color-blue-0)",
          }}
        >
          <Stack gap="md">
            <Group gap="sm">
              <ThemeIcon color="blue" size={36} radius="xl" variant="light">
                <ClipboardList size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="lg" c="dark.8">
                  Danh sách lịch hẹn cần nhập kết quả
                </Text>
                <Text size="xs" c="dimmed">
                  Chọn "Nhập kết quả" cho bệnh nhân đã check-in
                </Text>
              </Box>
            </Group>

            {doctorApptQuery.isLoading ? (
              <Stack gap="sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={72} radius="md" />
                ))}
              </Stack>
            ) : !doctorApptQuery.data || doctorApptQuery.data.length === 0 ? (
              <EmptyState
                description="Không có lịch hẹn nào cần nhập kết quả."
                icon={ClipboardList}
                title="Chưa có lịch hẹn"
              />
            ) : (
              <Stack gap="sm">
                {doctorApptQuery.data.map((appt) => {
                  const correspondingResult = resultsQuery.data?.find(
                    (r) => r.appointment_id === appt.id,
                  );
                  return (
                    <DoctorAppointmentRow
                      key={appt.id}
                      appt={appt}
                      onEnterResult={handleEnterResult}
                      onEditResult={handleEditResult}
                      correspondingResult={correspondingResult}
                    />
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Card>
      )}

      {/* All roles: Show list of results */}
      <Stack gap="md">
        <Text fw={700} size="lg" c="dark.8">
          {isDoctorOrAdmin ? "Kết quả đã nhập" : "Kết quả khám bệnh của bạn"}
        </Text>

        {resultsQuery.isError && (
          <Alert color="yellow" radius="md" variant="light">
            Chưa thể tải dữ liệu kết quả. Vui lòng thử lại.
          </Alert>
        )}

        {resultsQuery.isLoading ? (
          <Stack gap="sm">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={90} radius="lg" />
            ))}
          </Stack>
        ) : resultsQuery.data && resultsQuery.data.length > 0 ? (
          <Stack gap="sm">
            {resultsQuery.data.map((result) => (
              <PatientResultCard
                key={result.id}
                result={result}
                onEdit={handleEditResult}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState
            description={
              isDoctorOrAdmin
                ? "Chưa có kết quả nào được nhập."
                : "Kết quả khám bệnh sẽ xuất hiện tại đây sau khi bác sĩ xác nhận."
            }
            icon={FlaskConical}
            title="Chưa có kết quả"
          />
        )}
      </Stack>

      <EnterResultModal
        opened={modalOpened}
        onClose={closeModal}
        appointment={selectedAppt}
      />

      <EditResultModal
        opened={editModalOpened}
        onClose={closeEditModal}
        result={selectedResult}
      />
    </PageContainer>
  );
}
