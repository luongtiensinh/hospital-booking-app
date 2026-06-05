import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/shared/utils/error-utils";
import { appointmentsService } from "@/features/appointment/services/appointments-service";
import { useBookingStore } from "@/features/appointment/hooks/use-booking-store";

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const resetBooking = useBookingStore((state) => state.resetBooking);

  return useMutation({
    mutationFn: appointmentsService.createAppointment,
    onSuccess: async () => {
      toast.success("Đặt lịch thành công.");
      resetBooking();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments", "upcoming"] }),
        queryClient.invalidateQueries({ queryKey: ["appointment", "calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["appointment", "slots"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Đặt lịch thất bại."));
    },
  });
}
