// import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";

// export const dashboardApi = {
//   async getPatientOverview(): Promise<DashboardOverview> {
//     return {
//       upcomingCount: 1,
//       completedCount: 8,
//       unreadResultsCount: 1,
//       billingOutstanding: 350000,
//       nextAppointment: {
//         id: "app-1",
//         doctorName: "BS. Nguyễn Thị Lan",
//         specialty: "Nội khoa",
//         appointmentAt: "2026-05-25T09:00:00.000Z",
//         location: "Phòng khám 102 - Tầng 1 - Khu A",
//         status: "confirmed",
//         statusLabel: "Đã xác nhận",
//         qrCodeUrl: "mock-qr-value-1",
//       },
//       recentResults: [
//         {
//           id: "res-1",
//           examName: "Xét nghiệm công thức máu",
//           doctorName: "BS. Nguyễn Thị Lan",
//           reportedAt: "2026-05-18T10:30:00.000Z",
//           summary: "Các chỉ số huyết học bình thường. Cholesterol hơi cao nhẹ.",
//           status: "new",
//           statusLabel: "Mới",
//           pdfUrl: null,
//         },
//       ],
//     };
//   },
// };
import { supabase } from '@/lib/supabaseClient';
import type { DashboardOverview } from '@/features/dashboard/types/dashboard.types';

export const dashboardApi = {
  async getPatientOverview(): Promise<DashboardOverview> {
    // Query Supabase tables: doctor_schedules, appointments, invoices, medical_results
    const { data: schedules, error: err1 } = await supabase
      .from('doctor_schedules')
      .select('*')
      .order('appointment_at', { ascending: true })
      .limit(5);

    const { data: invoices, error: err2 } = await supabase
      .from('invoices')
      .select('*');

    // Tính toán nhanh (các giá trị mock ở đây pueden được điều chỉnh)
    const upcomingCount = schedules?.length ?? 0;
    const completedCount = 0; // Giả sử chưa có endpoint lịch sử
    const unreadResultsCount = 0; // có thể tính dựa trên medical_results
    const billingOutstanding =
      invoices?.reduce((sum, inv) => sum + Number(inv.total_amount), 0) ?? 0;

    // Lấy lịch hẹn gần nhất
    const nextAppointment = schedules?.[0] ?? null;

    return {
      upcomingCount,
      completedCount,
      unreadResultsCount,
      billingOutstanding,
      nextAppointment: nextAppointment
        ? {
          id: nextAppointment.id,
          doctorName: nextAppointment.doctor_name,
          specialty: nextAppointment.specialty,
          appointmentAt: nextAppointment.appointment_at,
          location: nextAppointment.location,
          status: 'confirmed',
          statusLabel: 'Đã xác nhận',
          qrCodeUrl: nextAppointment.qr_code ?? '',
        }
        : null,
      recentResults: [], // tuỳ muốn query từ `medical_results`
    };
  },
};

