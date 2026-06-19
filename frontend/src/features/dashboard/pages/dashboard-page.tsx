import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { PatientDashboardPage } from "./patient-dashboard-page";
import { DoctorDashboardPage } from "./doctor-dashboard-page";
import { AdminDashboardPage } from "./admin-dashboard-page";

/**
 * Điểm vào Dashboard duy nhất.
 * Tự động chuyển hướng đến giao diện phù hợp với role của user.
 */
export function DashboardPage() {
  const { role } = useAuthSession();

  if (role === "doctor") return <DoctorDashboardPage />;
  if (role === "admin") return <AdminDashboardPage />;

  // Mặc định: patient (và cả trường hợp role chưa xác định)
  return <PatientDashboardPage />;
}
