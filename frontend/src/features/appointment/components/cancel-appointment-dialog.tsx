import { useState } from "react";
import { Modal, Button, Text, Stack, Textarea, Alert, Group } from "@mantine/core";
import { AlertCircle, Info } from "lucide-react";
import { useCancelAppointment } from "@/features/appointment/hooks/use-cancel-appointment";
import { formatDateTime } from "@/shared/utils/formatters";

type CancelAppointmentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  counterName: string;
  appointmentAt: string;
};

export function CancelAppointmentDialog({
  isOpen,
  onClose,
  appointmentId,
  counterName,
  appointmentAt,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState("");
  const cancelMutation = useCancelAppointment();

  const handleConfirm = () => {
    cancelMutation.mutate(
      { id: appointmentId, reason },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Xác nhận hủy lịch khám"
      centered
      radius="md"
      overlayProps={{ blur: 3, backgroundOpacity: 0.55 }}
    >
      <Stack gap="md">
        <Alert variant="light" color="red" title="Cảnh báo quy định hủy lịch" icon={<AlertCircle size={16} />}>
          <ul className="pl-4 m-0 space-y-1 text-xs">
            <li>Chỉ được phép hủy lịch trước giờ khám tối thiểu 24 giờ.</li>
            <li>Để chống spam, bạn chỉ được phép hủy tối đa 3 lần trong 1 tuần.</li>
          </ul>
        </Alert>

        <div>
          <Text size="sm" fw={600}>Thông tin lịch hẹn:</Text>
          <Text size="sm" c="dimmed">• Quầy: {counterName}</Text>
          <Text size="sm" c="dimmed">• Thời gian: {formatDateTime(appointmentAt)}</Text>
        </div>

        <Textarea
          label="Lý do hủy (không bắt buộc)"
          placeholder="Nhập lý do hủy lịch của bạn..."
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          maxLength={200}
          rows={3}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} disabled={cancelMutation.isPending}>
            Quay lại
          </Button>
          <Button 
            color="red" 
            onClick={handleConfirm} 
            loading={cancelMutation.isPending}
            disabled={cancelMutation.isPending}
          >
            Đồng ý hủy lịch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
