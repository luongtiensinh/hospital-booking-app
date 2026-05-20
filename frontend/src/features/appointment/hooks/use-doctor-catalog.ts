import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointment/services/appointments-service";
import type { AppointmentFilterValues } from "@/features/appointment/types/appointment.types";

export function useDoctorCatalog(filters: AppointmentFilterValues) {
  return useQuery({
    queryKey: ["appointments", "doctors", filters],
    queryFn: () => appointmentsService.getDoctors(filters),
  });
}
