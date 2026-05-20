import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointment/services/appointments-service";

type UseDoctorCalendarParams = {
  doctorId: string | null;
  month: string;
};

export function useDoctorCalendar({
  doctorId,
  month,
}: UseDoctorCalendarParams) {
  return useQuery({
    queryKey: ["appointment", "calendar", doctorId, month],
    queryFn: () => appointmentsService.getDoctorCalendar(doctorId as string, month),
    enabled: Boolean(doctorId),
  });
}
