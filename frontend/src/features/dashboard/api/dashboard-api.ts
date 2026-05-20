import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";

export const dashboardApi = {
  async getPatientOverview(): Promise<DashboardOverview> {
    return {
      upcomingCount: 1,
      completedCount: 8,
      unreadResultsCount: 1,
      billingOutstanding: 350000,
      nextAppointment: {
        id: "app-1",
        doctorName: "BS. Nguyễn Thị Lan",
        specialty: "Nội khoa",
        appointmentAt: "2026-05-25T09:00:00.000Z",
        location: "Phòng khám 102 - Tầng 1 - Khu A",
        status: "confirmed",
        statusLabel: "Đã xác nhận",
        qrCodeUrl: "mock-qr-value-1",
      },
      recentResults: [
        {
          id: "res-1",
          examName: "Xét nghiệm công thức máu",
          doctorName: "BS. Nguyễn Thị Lan",
          reportedAt: "2026-05-18T10:30:00.000Z",
          summary: "Các chỉ số huyết học bình thường. Cholesterol hơi cao nhẹ.",
          status: "new",
          statusLabel: "Mới",
          pdfUrl: null,
        },
      ],
    };
  },
};

