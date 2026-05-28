import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";
import { httpClient } from "@/shared/services/http-client";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  detail?: string;
} & T;

export const dashboardApi = {
  async getPatientOverview(): Promise<DashboardOverview> {
    const { data } = await httpClient.get<ApiResponse<{ overview?: DashboardOverview }>>(
      "/appointments/overview",
    );
    return data.overview ?? {
      upcomingCount: 0,
      completedCount: 0,
      unreadResultsCount: 0,
      billingOutstanding: 0,
      nextAppointment: null,
      recentResults: [],
    };
  },
};
