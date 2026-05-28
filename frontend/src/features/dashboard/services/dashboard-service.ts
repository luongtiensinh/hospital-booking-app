import { dashboardApi } from "@/features/dashboard/api/dashboard-api";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";

export const dashboardService = {
  async getPatientOverview(): Promise<DashboardOverview> {
    const overview = await dashboardApi.getPatientOverview();

    return {
      ...overview,
      nextAppointment: overview.nextAppointment ?? null,
      recentResults: overview.recentResults ?? [],
    };
  },
};
