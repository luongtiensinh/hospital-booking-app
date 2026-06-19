import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointment/services/appointments-service";

type UseCounterCalendarParams = {
  counterId: string | null;
  month: string;
};

export function useCounterCalendar({
  counterId,
  month,
}: UseCounterCalendarParams) {
  return useQuery({
    queryKey: ["appointment", "calendar", counterId, month],
    queryFn: () => appointmentsService.getCalendar(counterId as string, month),
    enabled: Boolean(counterId),
  });
}
