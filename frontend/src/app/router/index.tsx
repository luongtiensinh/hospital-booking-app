import { lazy, Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/app/layouts/app-shell";
import { FullscreenState } from "@/shared/components/feedback/fullscreen-state";
import { APP_ROUTES } from "@/shared/constants/routes";
import { ForbiddenPage } from "@/pages/forbidden-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { RouterErrorPage } from "@/pages/router-error-page";

import { GuestRoute, ProtectedRoute } from "./route-guards";

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
const PatientDashboardPage = lazy(() =>
  import("@/features/dashboard/pages/patient-dashboard-page").then((module) => ({
    default: module.PatientDashboardPage,
  })),
);
const AppointmentsPage = lazy(() =>
  import("@/features/appointment/pages/appointments-page").then((module) => ({
    default: module.AppointmentsPage,
  })),
);
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
const InvoicesPage = lazy(() =>
  import("@/features/invoice/pages/invoices-page").then((module) => ({
    default: module.InvoicesPage,
  })),
);

function withSuspense(page: React.ReactNode) {
  return (
    <Suspense
      fallback={
        <FullscreenState
          description="Dang tai module phu hop voi route hien tai."
          icon={LoaderCircle}
          title="Dang tai giao dien"
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
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <RouterErrorPage />,
    children: [
      {
        index: true,
        element: withSuspense(<PatientDashboardPage />),
      },
      {
        path: APP_ROUTES.appointments.slice(1),
        element: withSuspense(<AppointmentsPage />),
      },
      {
        path: APP_ROUTES.qr.slice(1),
        element: withSuspense(<QrCheckInPage />),
      },
      {
        path: APP_ROUTES.results.slice(1),
        element: withSuspense(<MedicalResultsPage />),
      },
      {
        path: APP_ROUTES.invoices.slice(1),
        element: withSuspense(<InvoicesPage />),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
