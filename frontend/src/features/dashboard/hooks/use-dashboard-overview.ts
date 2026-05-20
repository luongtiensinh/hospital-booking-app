import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "@/features/dashboard/services/dashboard-service";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getPatientOverview,
  });
}
