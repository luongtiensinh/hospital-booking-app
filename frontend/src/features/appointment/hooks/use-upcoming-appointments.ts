import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointment/services/appointments-service";

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: appointmentsService.getUpcomingAppointments,
  });
}
