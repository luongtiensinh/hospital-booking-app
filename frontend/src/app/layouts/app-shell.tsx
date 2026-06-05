import { AppShell, Box, ScrollArea, Stack, Text } from "@mantine/core";
import { Outlet } from "react-router-dom";

import { AppHeader } from "@/app/layouts/app-header";
import { SideNav } from "@/app/layouts/side-nav";
import { HospitalLogo } from "@/shared/ui/hospital-logo";

const BOTTOM_NAV_HEIGHT = 68;

export function AppShellLayout() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "lg",
        collapsed: { mobile: true },
      }}
      padding={0}
      styles={{
        root: { minHeight: "100vh" },
        navbar: {
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(215,228,240,0.6)",
        },
        main: {
          background: "transparent",
        },
      }}
    >
      <AppShell.Header
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        <AppHeader />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section mb="lg">
          <Stack gap={6} align="flex-start">
            <HospitalLogo height={38} />
            <Box>
              <Text fw={700} size="sm" c="dark.8">
                Hệ thống Y tế số
              </Text>
              <Text size="xs" c="dimmed">
                BV Ung bướu Đà Nẵng
              </Text>
            </Box>
          </Stack>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          <SideNav />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box
          px={{ base: "sm", sm: "lg", lg: "xl" }}
          pt="md"
          pb={{ base: `${BOTTOM_NAV_HEIGHT + 16}px`, lg: "xl" }}
          style={{ minHeight: "calc(100vh - 60px)" }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>

      <Box
        hiddenFrom="lg"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--mantine-color-gray-2)",
          height: BOTTOM_NAV_HEIGHT,
          paddingBottom: "env(safe-area-inset-bottom)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <Box style={{ flex: 1, display: "flex", alignItems: "stretch" }}>
          <SideNav compact />
        </Box>
      </Box>
    </AppShell>
  );
}
