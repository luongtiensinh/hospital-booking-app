import type { PropsWithChildren } from "react";

import { Navigate, useLocation } from "react-router-dom";

import { APP_ROUTES } from "@/shared/constants/routes";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import type { UserRole } from "@/features/auth/types/auth.types";

type ProtectedRouteProps = PropsWithChildren<{
  allowedRoles?: readonly UserRole[];
}>;

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, role } = useAuthSession();

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={APP_ROUTES.login}
      />
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate replace to={APP_ROUTES.forbidden} />;
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuthSession();

  if (isAuthenticated) {
    return <Navigate replace to={APP_ROUTES.dashboard} />;
  }

  return <>{children}</>;
}
