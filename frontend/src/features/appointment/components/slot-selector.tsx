import {
  Card,
  Group,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
  Badge,
  Center,
} from "@mantine/core";
import { Clock3, Sun, Sunset } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";
import { useState, useEffect } from "react";

import type { AppointmentSlot } from "@/features/appointment/types/appointment.types";
import { useMemo } from "react";

type SlotSelectorProps = {
  slots: AppointmentSlot[];
  selectedSlotId: string | null;
  isLoading: boolean;
  onSelectSlot: (slot: AppointmentSlot) => void;
  onSelect?: () => void;
};

export function SlotSelector({
  slots,
  selectedSlotId,
  isLoading,
  onSelectSlot,
  onSelect,
}: SlotSelectorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filter out slots that are in the past
  const visibleSlots = useMemo(() => slots.filter((s) => !s.isPast), [slots]);

  const morningSlots = useMemo(
    () => visibleSlots.filter((s) => s.session === "morning"),
    [visibleSlots],
  );
  const afternoonSlots = useMemo(
    () => visibleSlots.filter((s) => s.session === "afternoon"),
    [visibleSlots],
  );

  // Default to the session that has available slots; prefer morning
  const defaultSession = morningSlots.length > 0 ? "morning" : "afternoon";
  const [activeSession, setActiveSession] = useState<"morning" | "afternoon">(defaultSession);

  // When slots reload (new date selected), reset to a session that has slots
  useEffect(() => {
    if (morningSlots.length > 0) {
      setActiveSession("morning");
    } else if (afternoonSlots.length > 0) {
      setActiveSession("afternoon");
    }
  }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSlots = activeSession === "morning" ? morningSlots : afternoonSlots;

  const hasMorning = morningSlots.length > 0;
  const hasAfternoon = afternoonSlots.length > 0;

  const renderSlotGrid = (sessionSlots: AppointmentSlot[]) => {
    if (sessionSlots.length === 0) {
      return (
        <Center py="xl">
          <Text size="sm" c="dimmed" ta="center">
            Không còn khung giờ khả dụng cho buổi này.
          </Text>
        </Center>
      );
    }

    return (
      <div
        className={
          isMobile
            ? "grid grid-cols-3 gap-2"
            : "grid grid-cols-2 sm:grid-cols-3 gap-2"
        }
      >
        {sessionSlots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          const isDisabled = slot.isBooked;

          let badgeColor = "teal";
          if (slot.remainingCapacity <= 3) badgeColor = "orange";
          if (slot.remainingCapacity === 0) badgeColor = "red";

          if (isMobile) {
            return (
              <UnstyledButton
                key={slot.id}
                disabled={isDisabled}
                onClick={() => {
                  onSelectSlot(slot);
                  onSelect?.();
                }}
                style={{
                  borderRadius: 8,
                  border: `1.5px solid ${isSelected
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
                  padding: "6px 8px",
                  opacity: isDisabled ? 0.6 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  boxShadow: isSelected
                    ? "0 0 0 2px var(--mantine-color-sky-2)"
                    : undefined,
                  transition: "all 0.12s ease",
                }}
              >
                <Group gap={2} justify="space-between" align="center" wrap="nowrap">
                  <Text
                    size="xs"
                    fw={750}
                    c={isSelected ? "sky.7" : isDisabled ? "dimmed" : "dark.7"}
                  >
                    {slot.startAt}
                  </Text>
                  <Badge
                    color={badgeColor}
                    variant={isSelected ? "filled" : "light"}
                    size="xs"
                    style={{ padding: "0 4px", height: 16, fontSize: 9, flexShrink: 0 }}
                  >
                    {slot.isBooked ? "Hết" : `${slot.remainingCapacity}c`}
                  </Badge>
                </Group>
              </UnstyledButton>
            );
          }

          // Desktop version — compact
          return (
            <UnstyledButton
              key={slot.id}
              disabled={isDisabled}
              onClick={() => {
                onSelectSlot(slot);
                onSelect?.();
              }}
              style={{
                borderRadius: 8,
                border: `1.5px solid ${isSelected
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
                padding: "6px 8px",
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
                boxShadow: isSelected ? "0 0 0 2px var(--mantine-color-sky-2)" : undefined,
                transition: "all 0.12s ease",
              }}
            >
              <Group gap={4} mb={3} justify="center" wrap="nowrap">
                <Clock3
                  size={12}
                  color={
                    isSelected
                      ? "var(--mantine-color-sky-6)"
                      : "var(--mantine-color-dark-4)"
                  }
                />
                <Text
                  size="xs"
                  fw={700}
                  c={isSelected ? "sky.7" : isDisabled ? "dimmed" : "dark.7"}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {slot.startAt} – {slot.endAt}
                </Text>
              </Group>
              <div style={{ textAlign: "center" }}>
                <Badge
                  color={badgeColor}
                  variant={isSelected ? "filled" : "light"}
                  size="xs"
                >
                  {slot.isBooked ? "Kín chỗ" : `Còn ${slot.remainingCapacity} chỗ`}
                </Badge>
              </div>
            </UnstyledButton>
          );
        })}
      </div>
    );
  };

  // ── Main render ──────────────────────────────────────────────────
  return (
    <Card
      radius="lg"
      withBorder
      p="sm"
      style={{
        borderColor: "var(--mantine-color-gray-2)",
        display: "flex",
        flexDirection: "column",
        height: isMobile ? undefined : "100%",
      }}
    >
      <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
        {/* Header */}
        <div>
          <Text fw={700} size="sm" c="dark.8">
            Chọn giờ khám
          </Text>
          <Text size="xs" c="dimmed">
            Chọn ca rồi bấm vào khung giờ phù hợp.
          </Text>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={48} radius="md" />
            ))}
          </div>
        ) : slots.length > 0 ? (
          visibleSlots.length > 0 ? (
            <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
              {/* Session tab switcher */}
              {!isMobile && (hasMorning || hasAfternoon) && (
                <SegmentedControl
                  value={activeSession}
                  onChange={(v) => setActiveSession(v as "morning" | "afternoon")}
                  size="xs"
                  radius="md"
                  fullWidth
                  data={[
                    {
                      value: "morning",
                      label: (
                        <Group gap={4} justify="center" wrap="nowrap">
                          <Sun size={13} />
                          <span>Buổi sáng</span>
                          {morningSlots.length > 0 && (
                            <Badge size="xs" variant="light" color="orange" style={{ fontSize: 9 }}>
                              {morningSlots.length}
                            </Badge>
                          )}
                        </Group>
                      ),
                      disabled: !hasMorning,
                    },
                    {
                      value: "afternoon",
                      label: (
                        <Group gap={4} justify="center" wrap="nowrap">
                          <Sunset size={13} />
                          <span>Buổi chiều</span>
                          {afternoonSlots.length > 0 && (
                            <Badge size="xs" variant="light" color="blue" style={{ fontSize: 9 }}>
                              {afternoonSlots.length}
                            </Badge>
                          )}
                        </Group>
                      ),
                      disabled: !hasAfternoon,
                    },
                  ]}
                />
              )}

              {/* Slot grid — scrollable on desktop so page itself stays still */}
              {isMobile ? (
                <Stack gap="md">
                  {morningSlots.length > 0 && (
                    <Stack gap="xs">
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                        ☀ Buổi sáng (08:00 – 11:50)
                      </Text>
                      {renderSlotGrid(morningSlots)}
                    </Stack>
                  )}
                  {afternoonSlots.length > 0 && (
                    <Stack gap="xs">
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                        🌅 Buổi chiều (13:00 – 16:50)
                      </Text>
                      {renderSlotGrid(afternoonSlots)}
                    </Stack>
                  )}
                </Stack>
              ) : (
                <ScrollArea
                  style={{ flex: 1 }}
                  offsetScrollbars
                  scrollbarSize={6}
                  type="hover"
                >
                  {renderSlotGrid(activeSlots)}
                </ScrollArea>
              )}
            </Stack>
          ) : (
            <Center py="xl">
              <Text size="sm" c="dimmed" ta="center">
                Hôm nay không còn khung giờ khả dụng nào. Vui lòng chọn ngày khác.
              </Text>
            </Center>
          )
        ) : (
          <Center py="xl">
            <Text size="sm" c="dimmed" ta="center">
              Vui lòng chọn ngày để xem lịch khả dụng.
            </Text>
          </Center>
        )}
      </Stack>
    </Card>
  );
}
