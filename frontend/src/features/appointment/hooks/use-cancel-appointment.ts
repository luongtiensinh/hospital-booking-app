import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/features/appointment/services/appointments-service';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/utils/error-utils';

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      appointmentsService.cancelAppointment(id, reason),
    onSuccess: () => {
      toast.success('Đã hủy lịch hẹn thành công');
      queryClient.invalidateQueries({ queryKey: ['appointments', 'upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', 'slots'] });
    },
    onError: (error) => {
      toast.error('Hủy lịch thất bại', {
        description: getErrorMessage(error),
      });
    },
  });
}
