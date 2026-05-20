import { RouterProvider } from "react-router-dom";

import { AuthBootstrapper } from "@/features/auth/components/auth-bootstrapper";

import { AppProviders } from "./providers/app-providers";
import { router } from "./router";

export function App() {
  return (
    <AppProviders>
      <AuthBootstrapper>
        <RouterProvider router={router} />
      </AuthBootstrapper>
    </AppProviders>
  );
}
