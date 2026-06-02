import { Card, Group, Skeleton, Stack, Text, UnstyledButton, Divider, Badge } from "@mantine/core";
import { Clock3 } from "lucide-react";

import type { AppointmentSlot } from "@/features/appointment/types/appointment.types";
import { useMemo } from "react";

type SlotSelectorProps = {
  slots: AppointmentSlot[];
  selectedSlotId: string | null;
  isLoading: boolean;
  onSelectSlot: (slot: AppointmentSlot) => void;
};

export function SlotSelector({ slots, selectedSlotId, isLoading, onSelectSlot }: SlotSelectorProps) {
  const morningSlots = useMemo(() => slots.filter((s) => s.session === "morning"), [slots]);
  const afternoonSlots = useMemo(() => slots.filter((s) => s.session === "afternoon"), [slots]);

  const renderSlotGrid = (sessionSlots: AppointmentSlot[]) => {
    if (sessionSlots.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sessionSlots.map((slot) => {
          const slotLabel = `${slot.startAt} - ${slot.endAt}`;
          const isSelected = selectedSlotId === slot.id;
          const isDisabled = slot.isBooked || slot.isPast;

          let badgeColor = "teal";
          if (slot.remainingCapacity <= 3) badgeColor = "orange";
          if (slot.remainingCapacity === 0) badgeColor = "red";
          if (slot.isPast) badgeColor = "gray";

          return (
            <UnstyledButton
              key={slot.id}
              disabled={isDisabled}
              onClick={() => onSelectSlot(slot)}
              style={{
                borderRadius: 10,
                border: `1.5px solid ${
                  isSelected
                    ? "var(--mantine-color-sky-5)"
                    : isDisabled
                    ? "var(--mantine-color-gray-3)"
                    : "var(--mantine-color-gray-2)"
                }`,
                background: isSelected
                  ? "var(--mantine-color-sky-0)"
                  : isDisabled
                  ? "var(--mantine-color-gray-0)"
                  : "white",
                padding: "8px 10px",
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
                boxShadow: isSelected ? "0 0 0 2px var(--mantine-color-sky-2)" : undefined,
                transition: "all 0.12s ease",
              }}
            >
              <Group gap={6} mb={4} justify="center">
                <Clock3 size={14} color={isSelected ? "var(--mantine-color-sky-6)" : "var(--mantine-color-dark-4)"} />
                <Text size="sm" fw={700} c={isSelected ? "sky.7" : isDisabled ? "dimmed" : "dark.7"}>{slotLabel}</Text>
              </Group>
              <div style={{ textAlign: "center" }}>
                <Badge 
                  color={badgeColor} 
                  variant={isSelected ? "filled" : "light"}
                  size="sm"
                >
                  {slot.isPast ? "Đã qua" : slot.isBooked ? "Kín chỗ" : `Còn ${slot.remainingCapacity} chỗ`}
                </Badge>
              </div>
            </UnstyledButton>
          );
        })}
      </div>
    );
  };

  return (
    <Card radius="lg" withBorder style={{ borderColor: "var(--mantine-color-gray-2)" }}>
      <Stack gap="md">
        <div>
          <Text fw={700} size="sm" c="dark.8">Chọn giờ khám</Text>
          <Text size="xs" c="dimmed">Bệnh viện chia ca sáng và chiều. Mỗi khung giờ tiếp nhận tối đa 10 bệnh nhân.</Text>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={64} radius="md" />
            ))}
          </div>
        ) : slots.length > 0 ? (
          <Stack gap="xl">
            {morningSlots.length > 0 && (
              <Stack gap="xs">
                <Divider label="Buổi sáng (08:00 - 11:50)" labelPosition="center" />
                {renderSlotGrid(morningSlots)}
              </Stack>
            )}
            
            {afternoonSlots.length > 0 && (
              <Stack gap="xs">
                <Divider label="Buổi chiều (13:00 - 16:50)" labelPosition="center" />
                {renderSlotGrid(afternoonSlots)}
              </Stack>
            )}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="xl">Vui lòng chọn ngày có slot để xem lịch khả dụng.</Text>
        )}
      </Stack>
    </Card>
  );
}
