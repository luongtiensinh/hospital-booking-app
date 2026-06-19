import { useQuery } from "@tanstack/react-query";

import { appointmentsService } from "@/features/appointment/services/appointments-service";

type UseCounterSlotsParams = {
  counterId: string | null;
  date: string | null;
};

export function useCounterSlots({ counterId, date }: UseCounterSlotsParams) {
  return useQuery({
    queryKey: ["appointment", "slots", counterId, date],
    queryFn: () => appointmentsService.getSlots(counterId as string, date as string),
    enabled: Boolean(counterId && date),
    refetchInterval: 15000,
  });
}
