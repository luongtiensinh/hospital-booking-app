import { lazy, Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { createBrowserRouter } from "react-router-dom";

import { AppShellLayout } from "@/app/layouts/app-shell";
import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { APP_ROUTES } from "@/shared/constants/routes";
import { ForbiddenPage } from "@/pages/forbidden-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { RouterErrorPage } from "@/pages/router-error-page";

import { GuestRoute, ProtectedRoute } from "./route-guards";

// ---------- Auth Pages ----------
const LoginPage = lazy(() =>
  import("@/features/auth/pages/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("@/features/auth/pages/register-page").then((module) => ({
    default: module.RegisterPage,
  })),
);

// ---------- Dashboard Pages (role-based) ----------
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  })),
);

// ---------- Patient Pages ----------
const AppointmentsPage = lazy(() =>
  import("@/features/appointment/pages/appointments-page").then((module) => ({
    default: module.AppointmentsPage,
  })),
);
const AppointmentHistoryPage = lazy(() =>
  import("@/features/appointment/pages/appointment-history-page").then((module) => ({
    default: module.AppointmentHistoryPage,
  })),
);

// ---------- Shared Pages ----------
const QrCheckInPage = lazy(() =>
  import("@/features/qr/pages/qr-check-in-page").then((module) => ({
    default: module.QrCheckInPage,
  })),
);
const MedicalResultsPage = lazy(() =>
  import("@/features/result/pages/medical-results-page").then((module) => ({
    default: module.MedicalResultsPage,
  })),
);

function withSuspense(page: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <FullscreenState
          description="Đang tải module phù hợp với route hiện tại."
          icon={LoaderCircle}
          title="Đang tải giao diện"
        />
      }
    >
      {page}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.login,
    element: (
      <GuestRoute>
        {withSuspense(<LoginPage />)}
      </GuestRoute>
    ),
    errorElement: <RouterErrorPage />,
  },
  {
    path: APP_ROUTES.register,
    element: (
      <GuestRoute>
        {withSuspense(<RegisterPage />)}
      </GuestRoute>
    ),
    errorElement: <RouterErrorPage />,
  },
  {
    path: APP_ROUTES.forbidden,
    element: <ForbiddenPage />,
    errorElement: <RouterErrorPage />,
  },
  {
    path: APP_ROUTES.dashboard,
    element: (
      <ProtectedRoute allowedRoles={["patient", "doctor", "admin"]}>
        <AppShellLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouterErrorPage />,
    children: [
      {
        index: true,
        // Dashboard tự xác định giao diện theo role bên trong
        element: withSuspense(<DashboardPage />),
      },
      {
        // Chỉ patient được vào trang đặt lịch
        path: APP_ROUTES.appointments.slice(1),
        element: (
          <ProtectedRoute allowedRoles={["patient"]}>
            {withSuspense(<AppointmentsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        // Chỉ patient được vào lịch sử đặt lịch cá nhân
        path: APP_ROUTES.appointmentHistory.slice(1),
        element: (
          <ProtectedRoute allowedRoles={["patient"]}>
            {withSuspense(<AppointmentHistoryPage />)}
          </ProtectedRoute>
        ),
      },
      {
        // QR Check-in: tất cả role đều truy cập được (nội dung khác nhau)
        path: APP_ROUTES.qr.slice(1),
        element: withSuspense(<QrCheckInPage />),
      },
      {
        // Kết quả: tất cả role đều truy cập (nội dung khác nhau theo role)
        path: APP_ROUTES.results.slice(1),
        element: withSuspense(<MedicalResultsPage />),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
