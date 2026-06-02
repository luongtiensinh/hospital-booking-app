import {
  ActionIcon,
  Card,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import type { DoctorCalendarDay } from "@/features/appointment/types/appointment.types";

type BookingCalendarProps = {
  currentMonth: Date;
  days: DoctorCalendarDay[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onChangeMonth: (month: Date) => void;
};

type CalendarCell = {
  isoDate: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  availability: DoctorCalendarDay | null;
};

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeDate(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarCells(
  monthDate: Date,
  days: DoctorCalendarDay[],
): CalendarCell[] {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));
  const today = normalizeDate(new Date());
  const map = new Map(days.map((item) => [item.date, item]));
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const normalized = normalizeDate(current);
    const isoDate = formatDateLocal(normalized);
    cells.push({
      isoDate,
      dayOfMonth: current.getDate(),
      isCurrentMonth: current.getMonth() === monthDate.getMonth(),
      isPast: normalized < today,
      availability: map.get(isoDate) ?? null,
    });
  }
  return cells;
}

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function BookingCalendar({
  currentMonth,
  days,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: BookingCalendarProps) {
  const calendarCells = useMemo(
    () => buildCalendarCells(currentMonth, days),
    [currentMonth, days],
  );
  const hasAvailableDays = days.some((d) => d.availableCapacity > 0);

  return (
    <Card
      radius="lg"
      withBorder
      style={{ borderColor: "var(--mantine-color-gray-2)" }}
    >
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Text fw={700} size="sm" c="dark.8">
              Chọn ngày khám
            </Text>
            <Text size="xs" c="dimmed">
              Lưu ý: Chủ nhật bệnh viện không làm việc
            </Text>
          </div>
          <Group gap={4}>
            <ActionIcon
              variant="default"
              size="sm"
              radius="md"
              onClick={() =>
                onChangeMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
            >
              <ChevronLeft size={14} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              size="sm"
              radius="md"
              onClick={() =>
                onChangeMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
            >
              <ChevronRight size={14} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Month label + legend */}
        <Group justify="space-between" align="center">
          <Text size="sm" fw={600}>
            {getMonthLabel(currentMonth)}
          </Text>
          <Group gap="sm">
            {[
              { color: "var(--mantine-color-teal-5)", label: "Còn chỗ" },
              { color: "var(--mantine-color-orange-5)", label: "Gần đầy" },
              { color: "var(--mantine-color-red-5)", label: "Kín chỗ" },
            ].map(({ color, label }) => (
              <Group key={label} gap={4}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                  }}
                />
                <Text size="xs" c="dimmed">
                  {label}
                </Text>
              </Group>
            ))}
          </Group>
        </Group>

        {/* Day headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
            textAlign: "center",
          }}
        >
          {DAY_LABELS.map((label) => (
            <Text key={label} size="xs" fw={600} c={label === "CN" ? "red.6" : "dimmed"} tt="uppercase">
              {label}
            </Text>
          ))}
        </div>

        {/* Calendar grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 4,
          }}
        >
          {calendarCells.map((cell) => {
            const availStatus = cell.availability?.status;
            const isClosed = availStatus === "closed";
            const isFull = availStatus === "full";
            
            const isDisabled =
              cell.isPast ||
              !cell.isCurrentMonth ||
              !cell.availability ||
              isClosed ||
              isFull;
              
            const isSelected = selectedDate === cell.isoDate;

            let bgColor = "white";
            let borderColor = "var(--mantine-color-gray-2)";

            if (isSelected) {
              bgColor = "var(--mantine-color-sky-5)";
              borderColor = "var(--mantine-color-sky-6)";
            } else if (isDisabled) {
              bgColor = "var(--mantine-color-gray-0)";
            } else if (availStatus === "available") {
              bgColor = "var(--mantine-color-teal-0)";
              borderColor = "var(--mantine-color-teal-3)";
            } else if (availStatus === "limited") {
              bgColor = "var(--mantine-color-orange-0)";
              borderColor = "var(--mantine-color-orange-3)";
            }

            return (
              <UnstyledButton
                key={cell.isoDate}
                disabled={isDisabled}
                onClick={() => onSelectDate(cell.isoDate)}
                style={{
                  borderRadius: 8,
                  border: `1.5px solid ${borderColor}`,
                  background: bgColor,
                  padding: "6px 4px",
                  opacity: !cell.isCurrentMonth ? 0.35 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "center",
                  minHeight: 52,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.12s ease",
                }}
              >
                <Text
                  size="xs"
                  fw={700}
                  style={{ color: isSelected ? "white" : isClosed ? "var(--mantine-color-red-5)" : undefined }}
                >
                  {cell.dayOfMonth}
                </Text>
                <Text
                  size="xs"
                  style={{
                    fontSize: 10,
                    color: isSelected
                      ? "rgba(255,255,255,0.8)"
                      : "var(--mantine-color-dimmed)",
                  }}
                >
                  {cell.availability && !isClosed
                    ? `${cell.availability.availableCapacity}c`
                    : "--"}
                </Text>
              </UnstyledButton>
            );
          })}
        </div>

        {!hasAvailableDays && (
          <Text size="xs" c="dimmed">
            Tháng này chưa có lịch khám khả dụng cho quầy được chọn.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
