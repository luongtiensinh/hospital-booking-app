import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointment/services/appointments-service";

type UseDoctorSlotsParams = {
  doctorId: string | null;
  date: string | null;
};

export function useDoctorSlots({ doctorId, date }: UseDoctorSlotsParams) {
  return useQuery({
    queryKey: ["appointment", "slots", doctorId, date],
    queryFn: () => appointmentsService.getDoctorSlots(doctorId as string, date as string),
    enabled: Boolean(doctorId && date),
    refetchInterval: 15000,
  });
}
