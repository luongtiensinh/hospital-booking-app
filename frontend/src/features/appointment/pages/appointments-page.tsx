import { CalendarPlus, ShieldCheck, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { AppointmentFiltersForm } from "@/features/appointment/components/appointment-filters-form";
import { BookingCalendar } from "@/features/appointment/components/booking-calendar";
import { BookingConfirmationCard } from "@/features/appointment/components/booking-confirmation-card";
import { DoctorAvailabilityCard } from "@/features/appointment/components/doctor-availability-card";
import { SlotSelector } from "@/features/appointment/components/slot-selector";
import { UpcomingAppointmentCard } from "@/features/appointment/components/upcoming-appointment-card";
import { useBookingFlow } from "@/features/appointment/hooks/use-booking-flow";
import { useCreateAppointment } from "@/features/appointment/hooks/use-create-appointment";
import { useDoctorCalendar } from "@/features/appointment/hooks/use-doctor-calendar";
import { useDoctorCatalog } from "@/features/appointment/hooks/use-doctor-catalog";
import { useDoctorSlots } from "@/features/appointment/hooks/use-doctor-slots";
import { useUpcomingAppointments } from "@/features/appointment/hooks/use-upcoming-appointments";
import { appointmentBookingSchema } from "@/features/appointment/schemas/appointment-booking-schema";
import type { AppointmentFilterValues } from "@/features/appointment/types/appointment.types";
import { EmptyState } from "@/shared/components/feedback/empty-state";

const initialFilters: AppointmentFilterValues = {
  search: "",
  specialty: "",
  preferredDate: "",
};

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function AppointmentsPage() {
  const [filters, setFilters] =
    useState<AppointmentFilterValues>(initialFilters);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  const {
    draft,
    selectedDoctor,
    selectDoctor,
    selectDate,
    selectSlot,
    canConfirm,
  } = useBookingFlow();

  const upcomingQuery = useUpcomingAppointments();
  const doctorsQuery = useDoctorCatalog(filters);
  const calendarQuery = useDoctorCalendar({
    doctorId: selectedDoctor?.id ?? null,
    month: getMonthKey(visibleMonth),
  });
  const slotsQuery = useDoctorSlots({
    doctorId: selectedDoctor?.id ?? null,
    date: draft.appointmentDate,
  });
  const createAppointmentMutation = useCreateAppointment();

  const doctorCountLabel = useMemo(() => {
    if (!doctorsQuery.data) return "Đang tải danh sách bác sĩ...";
    return `${doctorsQuery.data.length} bác sĩ khả dụng`;
  }, [doctorsQuery.data]);

  const handleConfirm = () => {
    const parsed = appointmentBookingSchema.safeParse({
      doctorId: draft.doctorId,
      appointmentDate: draft.appointmentDate,
      slotId: draft.slotId,
    });
    if (!parsed.success) return;
    createAppointmentMutation.mutate(parsed.data);
  };

  const hasError =
    doctorsQuery.isError ||
    calendarQuery.isError ||
    slotsQuery.isError ||
    upcomingQuery.isError;

  return (
    <PageContainer>
      <PageHeader
        description=""
        eyebrow="Appointment Booking"
        title="Đặt lịch khám"
      />

      {/* Filter bar */}
      <AppointmentFiltersForm
        defaultValues={filters}
        onSubmit={(values) => setFilters(values)}
      />

      {hasError && (
        <Alert color="yellow" radius="md" variant="light">
          Một hoặc nhiều dữ liệu chưa tải được. Vui lòng thử lại hoặc kiểm tra
          kết nối.
        </Alert>
      )}

      <Grid align="flex-start">
        {/* Col 1 — Doctor list */}
        <Grid.Col span={{ base: 12, xl: 5 }}>
          <Stack gap="sm">
            <Group gap="xs">
              <Stethoscope size={17} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={700} size="sm" c="dark.8">
                  Danh sách bác sĩ
                </Text>
                <Text size="xs" c="dimmed">
                  {doctorCountLabel}
                </Text>
              </div>
            </Group>

            {doctorsQuery.isLoading ? (
              <Stack gap="sm">
                <Skeleton height={200} radius="lg" />
                <Skeleton height={200} radius="lg" />
              </Stack>
            ) : doctorsQuery.data && doctorsQuery.data.length > 0 ? (
              <Stack gap="sm">
                {doctorsQuery.data.map((doctor) => (
                  <DoctorAvailabilityCard
                    doctor={doctor}
                    isSelected={selectedDoctor?.id === doctor.id}
                    key={doctor.id}
                    onSelect={(value) => {
                      selectDoctor(value);
                      setVisibleMonth(new Date());
                    }}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState
                description="Khi backend doctor catalog sẵn sàng, danh sách theo chuyên khoa và tên tìm kiếm sẽ hiển thị tại đây."
                icon={Stethoscope}
                title="Chưa có bác sĩ phù hợp"
              />
            )}
          </Stack>
        </Grid.Col>

        {/* Col 2 — Calendar + Slots */}
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Stack gap="sm">
            <Group gap="xs">
              <CalendarPlus size={17} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={700} size="sm" c="dark.8">
                  Lịch và slot khả dụng
                </Text>
              </div>
            </Group>

            {selectedDoctor ? (
              <>
                {calendarQuery.isLoading ? (
                  <Skeleton height={400} radius="lg" />
                ) : (
                  <BookingCalendar
                    currentMonth={visibleMonth}
                    days={calendarQuery.data ?? []}
                    onChangeMonth={setVisibleMonth}
                    onSelectDate={(date) => selectDate(date)}
                    selectedDate={draft.appointmentDate}
                  />
                )}
                <SlotSelector
                  isLoading={slotsQuery.isLoading}
                  onSelectSlot={selectSlot}
                  selectedSlotId={draft.slotId}
                  slots={slotsQuery.data ?? []}
                />
              </>
            ) : (
              <EmptyState
                description="Chọn một bác sĩ trong danh sách để xem lịch hoạt động và các khung giờ còn chỗ."
                icon={CalendarPlus}
                title="Chưa chọn bác sĩ"
              />
            )}
          </Stack>
        </Grid.Col>

        {/* Col 3 — Confirm + Upcoming */}
        <Grid.Col span={{ base: 12, xl: 3 }}>
          <Stack gap="sm">
            <Group gap="xs">
              <ShieldCheck size={17} color="var(--mantine-color-blue-6)" />
              <div>
                <Text fw={700} size="sm" c="dark.8">
                  Xác nhận & Lịch của bạn
                </Text>
              </div>
            </Group>

            <BookingConfirmationCard
              canConfirm={canConfirm}
              draft={draft}
              isPending={createAppointmentMutation.isPending}
              onConfirm={handleConfirm}
            />

            {/* Upcoming appointments */}
            <Group gap="xs" mt="xs">
              <Text fw={700} size="sm" c="dark.8">
                Lịch hẹn sắp tới
              </Text>
            </Group>

            {upcomingQuery.isLoading ? (
              <Stack gap="sm">
                <Skeleton height={120} radius="lg" />
                <Skeleton height={120} radius="lg" />
              </Stack>
            ) : upcomingQuery.data && upcomingQuery.data.length > 0 ? (
              <Stack gap="sm">
                {upcomingQuery.data.map((appointment) => (
                  <UpcomingAppointmentCard
                    appointment={appointment}
                    key={appointment.id}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyState
                description="Sau khi đặt lịch thành công, thông tin lịch hẹn sẽ được hiển thị ở đây."
                icon={ShieldCheck}
                title="Chưa có lịch hẹn nào"
              />
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
}
