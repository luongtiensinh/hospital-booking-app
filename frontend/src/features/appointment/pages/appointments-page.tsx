import {
  CalendarPlus,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import dayjs from "dayjs";

import {
  Alert,
  Stepper,
  Group,
  Button,
  Skeleton,
  Stack,
  Text,
  Box,
  Card,
  Divider,
  Paper,
  ThemeIcon,
  Modal,
  UnstyledButton,
  ScrollArea,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

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
import type { DoctorCalendarDay } from "@/features/appointment/types/appointment.types";

type DateStripCardProps = {
  day: DoctorCalendarDay;
  isSelected: boolean;
  onSelect: () => void;
};

function DateStripCard({ day, isSelected, onSelect }: DateStripCardProps) {
  const dateObj = dayjs(day.date);
  const vnDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const dayNameVN = vnDays[dateObj.day()];
  const dayNumber = dateObj.format("DD");

  const isClosed = day.status === "closed";
  const isFull = day.status === "full";
  const isDisabled = isClosed || isFull;

  let borderColor = "var(--mantine-color-gray-3)";
  let bgColor = "white";
  let textColor = "var(--mantine-color-dark-8)";
  let statusText = `${day.availableCapacity} chỗ`;
  let statusColor = "teal.6";

  if (isSelected) {
    bgColor = "var(--mantine-color-blue-6)";
    borderColor = "var(--mantine-color-blue-6)";
    textColor = "white";
    statusColor = "blue.1";
    statusText = "Đã chọn";
  } else if (isDisabled) {
    bgColor = "var(--mantine-color-gray-1)";
    borderColor = "var(--mantine-color-gray-2)";
    textColor = "var(--mantine-color-gray-4)";
    statusText = isClosed ? "Đóng cửa" : "Kín chỗ";
    statusColor = "red.5";
  } else if (day.status === "limited") {
    borderColor = "var(--mantine-color-orange-3)";
    statusColor = "orange.6";
  }

  return (
    <UnstyledButton
      disabled={isDisabled}
      onClick={onSelect}
      style={{
        flexShrink: 0,
        width: 72,
        height: 80,
        borderRadius: "var(--mantine-radius-md)",
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        transform: isSelected ? "scale(1.03)" : undefined,
        boxShadow: isSelected
          ? "0 4px 12px rgba(37, 99, 235, 0.15)"
          : undefined,
      }}
    >
      <Text
        size="10px"
        fw={700}
        style={{
          color: isSelected
            ? "rgba(255,255,255,0.8)"
            : "var(--mantine-color-dimmed)",
        }}
        tt="uppercase"
      >
        {dayNameVN}
      </Text>
      <Text
        size="lg"
        fw={850}
        style={{ color: textColor, lineHeight: 1.1 }}
        my={2}
      >
        {dayNumber}
      </Text>
      <Text
        size="9px"
        fw={600}
        style={{ color: isSelected ? "white" : statusColor }}
      >
        {statusText}
      </Text>
    </UnstyledButton>
  );
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function AppointmentsPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeStep, setActiveStep] = useState(0);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [successAppointment, setSuccessAppointment] = useState<any | null>(
    null,
  );
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const { draft, selectedCounter, selectDate, selectSlot, canConfirm } =
    useBookingFlow();

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
    if (!canConfirm || createAppointmentMutation.isPending) return;

    createAppointmentMutation.mutate(
      {
        counterId: draft.counterId!,
        appointmentDate: draft.appointmentDate!,
        slotId: draft.slotId!,
      },
      {
        onSuccess: (data) => {
          setSuccessAppointment(data);
          setActiveStep(3); // Go to completed step
        },
      },
    );
  };

  const nextStep = () =>
    setActiveStep((current) => (current < 2 ? current + 1 : current));
  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current));

  const hasError =
    calendarQuery.isError || slotsQuery.isError || upcomingQuery.isError;

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
          <Box
            p={isMobile ? "sm" : "md"}
            bg="white"
            style={{
              borderRadius: "var(--mantine-radius-lg)",
              border: "1px solid var(--mantine-color-gray-2)",
            }}
          >
            <Stepper
              active={activeStep}
              onStepClick={setActiveStep}
              color="blue"
              allowNextStepsSelect
              size="sm"
              styles={{
                stepLabel: { display: isMobile ? "none" : "block" },
                stepDescription: { display: isMobile ? "none" : "block" },
                stepBody: { display: isMobile ? "none" : "block" },
                step: {
                  padding: isMobile ? 0 : undefined,
                },
                steps: {
                  justifyContent: isMobile ? "space-around" : undefined,
                },
              }}
            >
              <Stepper.Step
                label="Chọn quầy"
                description="Quầy tiếp nhận"
                icon={<Activity size={18} />}
              >
                <Box mt="xl" mih={300}>
                  <CounterSelector onSelect={nextStep} />
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
                    <Stack gap="md">
                      {/* Mobile View: Horizontal Date Strip */}
                      <Box hiddenFrom="sm">
                        <Stack gap="xs">
                          <Group justify="space-between" align="center">
                            <div>
                              <Text fw={700} size="sm" c="dark.8">
                                Chọn ngày khám —{" "}
                                {dayjs(visibleMonth).format("MM/YYYY")}
                              </Text>
                              <Text size="xs" c="dimmed">
                                Vuốt ngang để xem lịch các ngày
                              </Text>
                            </div>

                            <Button
                              variant="subtle"
                              size="xs"
                              leftSection={<Calendar size={14} />}
                              onClick={() => setCalendarModalOpen(true)}
                            >
                              Chọn ngày khác
                            </Button>
                          </Group>

                          {calendarQuery.isLoading ? (
                            <Group
                              gap="xs"
                              wrap="nowrap"
                              style={{ overflow: "hidden" }}
                            >
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton
                                  key={i}
                                  width={72}
                                  height={80}
                                  radius="md"
                                />
                              ))}
                            </Group>
                          ) : (
                            <ScrollArea
                              scrollbars="x"
                              offsetScrollbars={false}
                              type="never"
                            >
                              <Group gap="xs" wrap="nowrap" pb="xs">
                                {calendarQuery.data
                                  ?.filter((d) => {
                                    const date = dayjs(d.date);
                                    const today = dayjs().startOf("day");
                                    return (
                                      date.isSame(today) || date.isAfter(today)
                                    );
                                  })
                                  .slice(0, 14)
                                  .map((day) => (
                                    <DateStripCard
                                      key={day.date}
                                      day={day}
                                      isSelected={
                                        draft.appointmentDate === day.date
                                      }
                                      onSelect={() => selectDate(day.date)}
                                    />
                                  ))}
                              </Group>
                            </ScrollArea>
                          )}

                          <SlotSelector
                            isLoading={slotsQuery.isLoading}
                            onSelectSlot={selectSlot}
                            selectedSlotId={draft.slotId}
                            slots={slotsQuery.data ?? []}
                            onSelect={nextStep}
                          />
                        </Stack>
                      </Box>

                      {/* Desktop View: Side-by-side Calendar and SlotSelector */}
                      <Box visibleFrom="sm">
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
                            onSelect={nextStep}
                          />
                        </div>
                      </Box>
                    </Stack>
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
                {successAppointment ? (
                  <Stack
                    gap="lg"
                    align="center"
                    py="md"
                    className="animate-fade-in"
                  >
                    <Box style={{ textAlign: "center" }}>
                      <ThemeIcon
                        color="green"
                        size={56}
                        radius="xl"
                        variant="light"
                        mb="sm"
                        mx="auto"
                      >
                        <CheckCircle2 size={36} />
                      </ThemeIcon>
                      <Text fw={850} size="xl" c="green.8">
                        ĐẶT LỊCH THÀNH CÔNG!
                      </Text>
                      <Text size="sm" c="dimmed" mt={4}>
                        Vui lòng lưu lại thông tin vé khám bệnh dưới đây
                      </Text>
                    </Box>

                    {/* Booking Ticket */}
                    <Card
                      withBorder
                      radius="xl"
                      p="xl"
                      style={{
                        width: "100%",
                        maxWidth: 420,
                        borderColor: "var(--mantine-color-gray-3)",
                        backgroundColor: "#fafcff",
                        backgroundImage:
                          "radial-gradient(circle at 0% 50%, transparent 12px, #fafcff 12px), radial-gradient(circle at 100% 50%, transparent 12px, #fafcff 12px)",
                        backgroundPosition: "left, right",
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                        position: "relative",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
                      }}
                    >
                      <Stack gap="md" align="center">
                        <div style={{ textAlign: "center" }}>
                          <Text fw={800} size="lg" c="blue.9">
                            VÉ KHÁM BỆNH
                          </Text>
                        </div>

                        <Divider
                          style={{ width: "100%", borderStyle: "dashed" }}
                          my="xs"
                        />

                        {successAppointment.qrCodeUrl && (
                          <Paper
                            withBorder
                            radius="lg"
                            p="xs"
                            style={{
                              backgroundColor: "white",
                              borderColor: "var(--mantine-color-gray-2)",
                            }}
                          >
                            <QRCodeSVG
                              bgColor="#ffffff"
                              fgColor="#11314d"
                              includeMargin
                              size={160}
                              value={successAppointment.qrCodeUrl}
                            />
                            <Text
                              size="xs"
                              fw={800}
                              c="blue.9"
                              mt="xs"
                              ta="center"
                            >
                              MÃ:{" "}
                              {successAppointment.id
                                .substring(0, 8)
                                .toUpperCase()}
                            </Text>
                          </Paper>
                        )}

                        <Divider
                          style={{ width: "100%", borderStyle: "dashed" }}
                          my="xs"
                        />

                        <Stack gap="xs" style={{ width: "100%" }}>
                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">
                              Dịch vụ:
                            </Text>
                            <Text size="sm" fw={700} c="blue.8">
                              {successAppointment.counterName}
                            </Text>
                          </Group>

                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">
                              Phòng khám:
                            </Text>
                            <Text size="sm" fw={700}>
                              {successAppointment.counterRoom}
                            </Text>
                          </Group>

                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">
                              Thời gian:
                            </Text>
                            <Text size="sm" fw={700}>
                              {dayjs(successAppointment.appointmentAt).format(
                                "HH:mm - DD/MM/YYYY",
                              )}
                            </Text>
                          </Group>
                        </Stack>

                        <Text
                          size="11px"
                          c="dimmed"
                          ta="center"
                          style={{ fontStyle: "italic" }}
                          mt="xs"
                        >
                          Vui lòng đến đúng giờ và đưa mã QR này cho quầy đón
                          tiếp để check-in tự động.
                        </Text>
                      </Stack>
                    </Card>

                    <Button
                      variant="filled"
                      size="md"
                      radius="md"
                      onClick={() => {
                        setSuccessAppointment(null);
                        setActiveStep(0);
                      }}
                      style={{
                        background:
                          "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                        border: 0,
                        color: "white",
                        boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                        minWidth: 160,
                      }}
                    >
                      Đặt lịch mới
                    </Button>
                  </Stack>
                ) : (
                  <EmptyState
                    description="Quá trình đặt lịch đã hoàn tất. Bạn có thể xem mã QR Code ở danh sách bên cạnh."
                    icon={ShieldCheck}
                    title="Hoàn thành"
                  />
                )}
              </Stepper.Completed>
            </Stepper>

            <Group justify="space-between" mt="xl">
              <Button
                variant="default"
                onClick={prevStep}
                disabled={activeStep === 0 || activeStep === 3}
                radius="md"
              >
                Quay lại
              </Button>

              {activeStep < 2 && (
                <Button
                  variant="filled"
                  onClick={nextStep}
                  disabled={
                    activeStep === 3 ||
                    (activeStep === 0 && !selectedCounter) ||
                    (activeStep === 1 &&
                      (!draft.appointmentDate || !draft.slotId))
                  }
                  radius="md"
                  style={{
                    background:
                      (activeStep === 0 && !selectedCounter) ||
                      (activeStep === 1 &&
                        (!draft.appointmentDate || !draft.slotId))
                        ? undefined
                        : "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
                    border: 0,
                    color:
                      (activeStep === 0 && !selectedCounter) ||
                      (activeStep === 1 &&
                        (!draft.appointmentDate || !draft.slotId))
                        ? undefined
                        : "white",
                    boxShadow:
                      (activeStep === 0 && !selectedCounter) ||
                      (activeStep === 1 &&
                        (!draft.appointmentDate || !draft.slotId))
                        ? undefined
                        : "0 8px 16px rgba(37, 99, 235, 0.15)",
                  }}
                >
                  Tiếp theo
                </Button>
              )}
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

      {/* Calendar Modal for Mobile */}
      <Modal
        opened={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        title={<Text fw={700}>Chọn ngày khám</Text>}
        centered
        radius="lg"
        padding="md"
        size="sm"
        hiddenFrom="sm"
      >
        {calendarQuery.isLoading ? (
          <Skeleton height={350} radius="lg" />
        ) : (
          <BookingCalendar
            currentMonth={visibleMonth}
            days={calendarQuery.data ?? []}
            onChangeMonth={setVisibleMonth}
            onSelectDate={(date) => {
              selectDate(date);
              setCalendarModalOpen(false);
            }}
            selectedDate={draft.appointmentDate}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
