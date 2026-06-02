import { useQuery } from "@tanstack/react-query";
import { appointmentsService } from "@/features/appointment/services/appointments-service";

export function useCounters() {
  return useQuery({
    queryKey: ["counters"],
    queryFn: () => appointmentsService.getCounters(),
    staleTime: 5 * 60 * 1000,
  });
}
