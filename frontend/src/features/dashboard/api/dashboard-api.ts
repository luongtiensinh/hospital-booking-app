import { httpClient } from "@/shared/services/http-client";
import { unwrapApiResponse, type ApiResult } from "@/shared/types/api.types";
import type { DashboardOverview } from "@/features/dashboard/types/dashboard.types";

export const dashboardApi = {
  async getPatientOverview() {
    const response = await httpClient.get<ApiResult<DashboardOverview>>(
      "/patients/dashboard-overview",
    );

    return unwrapApiResponse(response.data);
  },
};
