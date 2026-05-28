import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@mantine/core";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      opened={isOpen}
      onClose={isConfirming ? () => {} : onCancel}
      title={
        <Group gap="sm">
          <ThemeIcon color="red" variant="light" size="md" radius="md">
            <AlertTriangle size={16} />
          </ThemeIcon>
          <Text fw={700} size="md">{title}</Text>
        </Group>
      }
      centered
      radius="lg"
      padding="xl"
      size="sm"
      withCloseButton={!isConfirming}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack gap="xl">
        <Text size="sm" c="dimmed" lh={1.6}>{description}</Text>
        <Group justify="flex-end" gap="sm">
          <Button
            variant="default"
            radius="md"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            color="red"
            radius="md"
            loading={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? "Đang xử lý..." : confirmText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
