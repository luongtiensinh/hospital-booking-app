import { CalendarPlus, ShieldCheck, Activity } from "lucide-react";
import { useState } from "react";

import { Alert, Stepper, Group, Button, Skeleton, Stack, Text, Box } from "@mantine/core";

import { PageContainer } from "@/app/layouts/page-container";
import { PageHeader } from "@/app/layouts/page-header";
import { BookingCalendar } from "@/features/appointment/components/booking-calendar";
import { BookingConfirmationCard } from "@/features/appointment/components/booking-confirmation-card";
import { CounterSelector } from "@/features/appointment/components/counter-selector";
import { SlotSelector } from "@/features/appointment/components/slot-selector";
import { UpcomingAppointmentCard } from "@/features/appointment/components/upcoming-appointment-card";
import { useBookingFlow } from "@/features/appointment/hooks/use-booking-flow";
import { useCreateAppointment } from "@/features/appointment/hooks/use-create-appointment";
import { useCounterCalendar } from "@/features/appointment/hooks/use-counter-calendar";
import { useCounterSlots } from "@/features/appointment/hooks/use-counter-slots";
import { useUpcomingAppointments } from "@/features/appointment/hooks/use-upcoming-appointments";
import { EmptyState } from "@/shared/components/feedback/empty-state";

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function AppointmentsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());

  const {
    draft,
    selectedCounter,
    selectDate,
    selectSlot,
    canConfirm,
  } = useBookingFlow();

  const upcomingQuery = useUpcomingAppointments();

  const calendarQuery = useCounterCalendar({
    counterId: selectedCounter?.id ?? null,
    month: getMonthKey(visibleMonth),
  });

  const slotsQuery = useCounterSlots({
    counterId: selectedCounter?.id ?? null,
    date: draft.appointmentDate,
  });

  const createAppointmentMutation = useCreateAppointment();

  const handleConfirm = () => {
    if (!canConfirm) return;
    createAppointmentMutation.mutate(
      {
        counterId: draft.counterId!,
        appointmentDate: draft.appointmentDate!,
        slotId: draft.slotId!,
      },
      {
        onSuccess: () => {
          setActiveStep(0);
        }
      }
    );
  };

  const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  const hasError = calendarQuery.isError || slotsQuery.isError || upcomingQuery.isError;

  return (
    <PageContainer>
      <PageHeader
        description="Đăng ký lịch khám chữa bệnh trực tuyến nhanh chóng, tiện lợi."
        eyebrow="Booking"
        title="Đặt lịch khám"
      />

      {hasError && (
        <Alert color="yellow" mb="lg" radius="md" variant="light">
          Một hoặc nhiều dữ liệu chưa tải được. Vui lòng thử lại hoặc kiểm tra
          kết nối.
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <Box p="md" bg="white" style={{ borderRadius: 'var(--mantine-radius-lg)', border: '1px solid var(--mantine-color-gray-2)' }}>
            <Stepper active={activeStep} onStepClick={setActiveStep} color="sky" allowNextStepsSelect={false} size="sm">
              <Stepper.Step label="Chọn quầy" description="Quầy tiếp nhận" icon={<Activity size={18} />}>
                <Box mt="xl" mih={300}>
                  <CounterSelector />
                </Box>
              </Stepper.Step>

              <Stepper.Step
                label="Thời gian"
                description="Ngày & Giờ khám"
                icon={<CalendarPlus size={18} />}
                allowStepSelect={activeStep > 1 || selectedCounter !== null}
              >
                <Box mt="xl">
                  {selectedCounter ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    </div>
                  ) : (
                    <EmptyState
                      description="Vui lòng quay lại bước 1 để chọn quầy tiếp nhận trước khi chọn thời gian."
                      icon={CalendarPlus}
                      title="Chưa chọn quầy"
                    />
                  )}
                </Box>
              </Stepper.Step>

              <Stepper.Step
                label="Xác nhận"
                description="Hoàn tất đặt lịch"
                icon={<ShieldCheck size={18} />}
                allowStepSelect={canConfirm}
              >
                <Box mt="xl" maw={500} mx="auto">
                  <BookingConfirmationCard
                    canConfirm={canConfirm}
                    draft={draft}
                    isPending={createAppointmentMutation.isPending}
                    onConfirm={handleConfirm}
                  />
                </Box>
              </Stepper.Step>

              <Stepper.Completed>
                <EmptyState
                  description="Quá trình đặt lịch đã hoàn tất. Bạn có thể xem mã QR Code ở danh sách bên cạnh."
                  icon={ShieldCheck}
                  title="Hoàn thành"
                />
              </Stepper.Completed>
            </Stepper>

            <Group justify="space-between" mt="xl">
              <Button variant="default" onClick={prevStep} disabled={activeStep === 0 || activeStep === 3}>
                Quay lại
              </Button>
              <Button
                onClick={nextStep}
                color="sky"
                disabled={
                  (activeStep === 0 && !selectedCounter) ||
                  (activeStep === 1 && (!draft.appointmentDate || !draft.slotId))
                }
              >
                Tiếp theo
              </Button>
            </Group>
          </Box>
        </div>

        <div className="xl:col-span-4">
          <Stack gap="md">
            <Group gap="xs">
              <ShieldCheck size={20} color="var(--mantine-color-sky-6)" />
              <div>
                <Text fw={700} size="md" c="dark.8">
                  Lịch hẹn sắp tới
                </Text>
              </div>
            </Group>

            {upcomingQuery.isLoading ? (
              <Stack gap="sm">
                <Skeleton height={140} radius="lg" />
                <Skeleton height={140} radius="lg" />
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
                description="Bạn chưa có lịch khám nào sắp tới. Lịch khám sẽ hiển thị ở đây sau khi đặt thành công."
                icon={ShieldCheck}
                title="Chưa có lịch hẹn nào"
              />
            )}
          </Stack>
        </div>
      </div>
    </PageContainer>
  );
}
