import { CalendarPlus, ShieldCheck, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

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
import { Alert } from "@/shared/ui/alert";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

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
  const [filters, setFilters] = useState<AppointmentFilterValues>(initialFilters);
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
    if (!doctorsQuery.data) {
      return "Dang tai bac si...";
    }

    return `${doctorsQuery.data.length} bac si kha dung`;
  }, [doctorsQuery.data]);

  const handleConfirm = () => {
    const parsed = appointmentBookingSchema.safeParse({
      doctorId: draft.doctorId,
      appointmentDate: draft.appointmentDate,
      slotId: draft.slotId,
    });

    if (!parsed.success) {
      return;
    }

    createAppointmentMutation.mutate(parsed.data);
  };

  return (
    <PageContainer>
      <PageHeader
        description="Luong dat lich gom danh sach bac si, lich theo ngay, slot theo thoi gian thuc va the xac nhan rieng de benh nhan thao tac ro rang tren mobile."
        eyebrow="Appointment Booking"
        title="Dat lich kham"
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Tim bac si va chuyen khoa</h2>
            <p className="text-sm text-muted-foreground">
              Filter duoc validate bang Zod va doctor catalog chi consume du lieu tu
              service layer.
            </p>
          </div>
          <AppointmentFiltersForm
            defaultValues={filters}
            onSubmit={(values) => setFilters(values)}
          />
        </CardContent>
      </Card>

      {(doctorsQuery.isError ||
        calendarQuery.isError ||
        slotsQuery.isError ||
        upcomingQuery.isError) && (
        <Alert className="border-warning/20 bg-warning/5 text-warning">
          Mot hoac nhieu endpoint booking chua tra ve dung contract. Frontend da
          san sang cho doctor list, lich theo ngay, slot realtime va tao lich hen.
        </Alert>
      )}

      <section className="section-grid">
        <div className="space-y-4 xl:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Danh sach bac si</h2>
                <p className="text-sm text-muted-foreground">{doctorCountLabel}</p>
              </div>
            </div>
            <div className="hidden rounded-full bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground md:block">
              Doctor picker
            </div>
          </div>

          {doctorsQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          ) : doctorsQuery.data && doctorsQuery.data.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
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
            </div>
          ) : (
            <EmptyState
              description="Khi backend doctor catalog san sang, danh sach theo chuyen khoa va ten tim kiem se hien thi tai day."
              icon={Stethoscope}
              title="Chua co bac si phu hop"
            />
          )}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <div className="flex items-center gap-3">
            <CalendarPlus className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Lich va slot kha dung</h2>
              <p className="text-sm text-muted-foreground">
                Chon bac si truoc, sau do chon ngay va gio kham.
              </p>
            </div>
          </div>

          {selectedDoctor ? (
            <>
              {calendarQuery.isLoading ? (
                <Skeleton className="h-[440px]" />
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
              description="Chon mot bac si trong danh sach de xem lich hoat dong va cac khung gio con cho."
              icon={CalendarPlus}
              title="Chua chon bac si"
            />
          )}
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Xac nhan va lich cua ban</h2>
              <p className="text-sm text-muted-foreground">
                Tong hop thong tin truoc khi gui API create appointment.
              </p>
            </div>
          </div>

          <BookingConfirmationCard
            canConfirm={canConfirm}
            draft={draft}
            isPending={createAppointmentMutation.isPending}
            onConfirm={handleConfirm}
          />

          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Lich hen sap toi</h3>
                <p className="text-sm text-muted-foreground">
                  Theo doi cac lich da xac nhan va lien ket QR check-in.
                </p>
              </div>

              {upcomingQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
              ) : upcomingQuery.data && upcomingQuery.data.length > 0 ? (
                <div className="space-y-4">
                  {upcomingQuery.data.map((appointment) => (
                    <UpcomingAppointmentCard
                      appointment={appointment}
                      key={appointment.id}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  description="Sau khi dat lich thanh cong, thong tin lich hen se duoc hien thi o day."
                  icon={ShieldCheck}
                  title="Chua co lich hen nao"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
