import { AppShell, Box, ScrollArea, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";

import { AppHeader } from "@/app/layouts/app-header";
import { LogoMark } from "@/app/layouts/logo-mark";
import { SideNav } from "@/app/layouts/side-nav";

export function AppShellLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "lg",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
      styles={{
        root: { minHeight: "100vh" },
        navbar: {
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(215,228,240,0.6)",
        },
        main: {
          background: "transparent",
          paddingBottom: 80, // space for mobile bottom nav
        },
      }}
    >
      {/* Header — replaced by AppHeader component inline due to positioning */}
      <AppShell.Header
        style={{
          background: "rgba(244,248,251,0)",
          border: "none",
          padding: 0,
        }}
      >
        <AppHeader />
      </AppShell.Header>

      {/* Sidebar — desktop */}
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Box mb="lg">
            <Stack gap={6} align="flex-start">
              <LogoMark size={44} />
              <Box>
                <Text fw={700} size="md" c="dark.8">
                  MedCare Portal
                </Text>
              </Box>
            </Stack>
          </Box>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea}>
          <SideNav />
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main>
        <Box px={{ base: "md", sm: "xl", lg: "xl" }} py="lg">
          <Outlet />
        </Box>
      </AppShell.Main>

      {/* Bottom navigation — mobile only */}
      <Box
        hiddenFrom="lg"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(244,248,251,0.96)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(215,228,240,0.7)",
          padding: "8px 12px",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        <SideNav compact />
      </Box>
    </AppShell>
  );
}
