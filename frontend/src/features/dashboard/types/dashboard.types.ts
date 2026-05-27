import type { AppointmentSummary } from "@/features/appointment/types/appointment.types";
import type { ResultSummary } from "@/features/result/types/result.types";

export type DashboardOverview = {
  upcomingCount: number;
  completedCount: number;
  unreadResultsCount: number;
  billingOutstanding: number;
  nextAppointment: AppointmentSummary | null;
  recentResults: ResultSummary[];
};
