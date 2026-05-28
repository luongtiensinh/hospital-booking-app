import { Card, Group, Skeleton, Stack, Text, UnstyledButton } from "@mantine/core";
import { Clock3 } from "lucide-react";

import type { AppointmentSlot } from "@/features/appointment/types/appointment.types";

type SlotSelectorProps = {
  slots: AppointmentSlot[];
  selectedSlotId: string | null;
  isLoading: boolean;
  onSelectSlot: (slot: AppointmentSlot) => void;
};

export function SlotSelector({ slots, selectedSlotId, isLoading, onSelectSlot }: SlotSelectorProps) {
  return (
    <Card radius="lg" withBorder style={{ borderColor: "var(--mantine-color-gray-2)" }}>
      <Stack gap="sm">
        <div>
          <Text fw={700} size="sm" c="dark.8">Chọn giờ khám</Text>
          <Text size="xs" c="dimmed">Slot đã đặt sẽ bị vô hiệu hóa. Dữ liệu tự động cập nhật.</Text>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={64} radius="md" />
            ))}
          </div>
        ) : slots.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {slots.map((slot) => {
              const slotLabel = `${slot.startAt.slice(11, 16)} - ${slot.endAt.slice(11, 16)}`;
              const isSelected = selectedSlotId === slot.id;

              return (
                <UnstyledButton
                  key={slot.id}
                  disabled={slot.isBooked}
                  onClick={() => onSelectSlot(slot)}
                  style={{
                    borderRadius: 10,
                    border: `1.5px solid ${
                      isSelected
                        ? "var(--mantine-color-blue-5)"
                        : slot.isBooked
                        ? "var(--mantine-color-gray-3)"
                        : "var(--mantine-color-gray-2)"
                    }`,
                    background: isSelected
                      ? "var(--mantine-color-blue-0)"
                      : slot.isBooked
                      ? "var(--mantine-color-gray-0)"
                      : "white",
                    padding: "8px 10px",
                    opacity: slot.isBooked ? 0.5 : 1,
                    cursor: slot.isBooked ? "not-allowed" : "pointer",
                    boxShadow: isSelected ? "0 0 0 2px var(--mantine-color-blue-2)" : undefined,
                    transition: "all 0.12s ease",
                  }}
                >
                  <Group gap={6} mb={2}>
                    <Clock3 size={11} color="var(--mantine-color-blue-6)" />
                    <Text size="xs" fw={700} c={isSelected ? "blue.7" : "dark.7"}>{slotLabel}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed" truncate>{slot.roomLabel}</Text>
                    <Text size="xs" fw={600} c={slot.isBooked ? "dimmed" : "teal.6"}>
                      {slot.isBooked ? "Đã đặt" : `${slot.remainingCapacity} chỗ`}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </div>
        ) : (
          <Text size="xs" c="dimmed">Vui lòng chọn ngày có slot để xem lịch khả dụng.</Text>
        )}
      </Stack>
    </Card>
  );
}
