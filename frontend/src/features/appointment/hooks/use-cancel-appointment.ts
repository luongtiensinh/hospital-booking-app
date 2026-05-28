import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/features/appointment/api/appointments-api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/utils/error-utils';

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => 
      appointmentsApi.cancelAppointment(appointmentId),
    onSuccess: () => {
      toast.success('Đã hủy lịch hẹn thành công');
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['next-appointment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-slots'] });
    },
    onError: (error) => {
      toast.error('Hủy lịch thất bại', {
        description: getErrorMessage(error),
      });
    },
  });
}
