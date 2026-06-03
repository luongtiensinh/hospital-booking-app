import { useState } from "react";
import { ClipboardList, FlaskConical, Plus, Save, X } from "lucide-react";

import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import dayjs from "dayjs";

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
function PatientResultCard({ result }: { result: BackendResult }) {
  const date = result.appointments?.appointment_date
    ? dayjs(result.appointments.appointment_date).format("DD/MM/YYYY")
    : "—";

  return (
    <Card withBorder radius="lg" p="md" style={{ borderColor: "var(--mantine-color-gray-2)" }}>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <ThemeIcon color="blue" size={40} radius="xl" variant="light">
            <FlaskConical size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.8">
              {result.diagnosis ?? "Chẩn đoán chưa có"}
            </Text>
            <Text size="xs" c="dimmed">
              {date}
            </Text>
          </Box>
        </Group>
        <Badge color="green" variant="light" radius="sm">
          Đã có kết quả
        </Badge>
      </Group>
      {result.result && (
        <Text size="sm" c="dark.6" style={{ fontStyle: "italic" }}>
          "{result.result}"
        </Text>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------
// Doctor / Admin: Enter result modal
// ---------------------------------------------------------------
function EnterResultModal({
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
          <Button variant="default" radius="md" leftSection={<X size={14} />} onClick={onClose}>
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
// Doctor / Admin appointment row
// ---------------------------------------------------------------
function DoctorAppointmentRow({
  appt,
  onEnterResult,
}: {
  appt: DoctorAppointment;
  onEnterResult: (appt: DoctorAppointment) => void;
}) {
  const STATUS_LABEL: Record<string, { label: string; color: string }> = {
    confirmed: { label: "Đã xác nhận", color: "blue" },
    "checked-in": { label: "Đã check-in", color: "teal" },
    completed: { label: "Đã khám", color: "green" },
  };
  const badge = STATUS_LABEL[appt.status] ?? { label: appt.status, color: "gray" };
  const canEnterResult = appt.status === "checked-in" || appt.status === "confirmed";

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

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedAppt, setSelectedAppt] = useState<DoctorAppointment | null>(null);

  const handleEnterResult = (appt: DoctorAppointment) => {
    setSelectedAppt(appt);
    openModal();
  };

  const pageDescription = isDoctorOrAdmin
    ? "Xem danh sách bệnh nhân và nhập kết quả khám."
    : "Xem lịch sử kết quả xét nghiệm của bạn.";

  return (
    <PageContainer>
      <PageHeader
        description={pageDescription}
        eyebrow={isDoctorOrAdmin ? "Doctor / Admin" : "Medical Results"}
        title="Kết quả xét nghiệm"
      />

      {/* Doctor / Admin: Appointment list để nhập kết quả */}
      {isDoctorOrAdmin && (
        <Card
          withBorder
          radius="lg"
          p="lg"
          mb="xl"
          style={{ borderColor: "var(--mantine-color-blue-2)", background: "var(--mantine-color-blue-0)" }}
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
                {doctorApptQuery.data.map((appt) => (
                  <DoctorAppointmentRow
                    key={appt.id}
                    appt={appt}
                    onEnterResult={handleEnterResult}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      )}

      {/* All roles: Show list of results */}
      <Stack gap="md">
        <Text fw={700} size="lg" c="dark.8">
          {isDoctorOrAdmin ? "Kết quả đã nhập" : "Kết quả xét nghiệm của bạn"}
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
              <PatientResultCard key={result.id} result={result} />
            ))}
          </Stack>
        ) : (
          <EmptyState
            description={
              isDoctorOrAdmin
                ? "Chưa có kết quả nào được nhập."
                : "Kết quả xét nghiệm sẽ xuất hiện tại đây sau khi bác sĩ xác nhận."
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
    </PageContainer>
  );
}
