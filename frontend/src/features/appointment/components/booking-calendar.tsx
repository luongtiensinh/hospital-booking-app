import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/cn";
import type { DoctorCalendarDay } from "@/features/appointment/types/appointment.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

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
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function buildCalendarCells(monthDate: Date, days: DoctorCalendarDay[]) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));
  const today = normalizeDate(new Date());
  const map = new Map(days.map((item) => [item.date, item]));
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + index);
    const normalized = normalizeDate(current);
    const isoDate = normalized.toISOString().slice(0, 10);
    const availability = map.get(isoDate) ?? null;

    cells.push({
      isoDate,
      dayOfMonth: current.getDate(),
      isCurrentMonth: current.getMonth() === monthDate.getMonth(),
      isPast: normalized < today,
      availability,
    });
  }

  return cells;
}

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

  const hasAvailableDays = days.some((day) => day.availableSlots > 0);

  return (
    <Card className="h-full">
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Chon ngay kham</h3>
            <p className="text-sm text-muted-foreground">
              Ngay qua khu bi khoa. Ngay con slot duoc danh dau de de dat lich.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                onChangeMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
                )
              }
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() =>
                onChangeMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                )
              }
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h4 className="text-base font-semibold">{getMonthLabel(currentMonth)}</h4>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Con slot
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              Sap day
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              Het slot
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            const isDisabled =
              cell.isPast ||
              !cell.isCurrentMonth ||
              !cell.availability ||
              cell.availability.availableSlots === 0;
            const isSelected = selectedDate === cell.isoDate;
            const availabilityTone =
              cell.availability?.status === "available"
                ? "border-primary/30 bg-primary/10 text-primary"
                : cell.availability?.status === "limited"
                  ? "border-warning/40 bg-warning/10 text-warning"
                  : "border-border bg-white text-muted-foreground";

            return (
              <button
                className={cn(
                  "flex min-h-16 flex-col rounded-2xl border px-2 py-3 text-left transition-all sm:min-h-20",
                  cell.isCurrentMonth ? "opacity-100" : "opacity-35",
                  isDisabled
                    ? "cursor-not-allowed border-border bg-secondary/40 text-muted-foreground"
                    : availabilityTone,
                  isSelected && "ring-4 ring-primary/15",
                )}
                disabled={isDisabled}
                key={cell.isoDate}
                onClick={() => onSelectDate(cell.isoDate)}
                type="button"
              >
                <span className="text-sm font-semibold">{cell.dayOfMonth}</span>
                <span className="mt-1 text-[11px] leading-4">
                  {cell.availability ? `${cell.availability.availableSlots} slot` : "--"}
                </span>
              </button>
            );
          })}
        </div>

        {!hasAvailableDays ? (
          <p className="text-sm text-muted-foreground">
            Thang nay hien chua co slot kha dung cho bac si duoc chon.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
