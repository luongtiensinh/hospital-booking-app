import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { Bell, ChevronDown, LogOut, ShieldCheck } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLogout } from "@/features/auth/hooks/use-logout";

export function AppHeader() {
  const { displayName, initials, roleLabel } = useAuthSession();
  const { logout, isPending } = useLogout();

  return (
    <Box
      component="header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--mantine-color-gray-2)",
        background: "rgba(244,248,251,0.92)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Group
        px={{ base: "md", sm: "xl" }}
        py="sm"
        justify="space-between"
        wrap="nowrap"
      >
        {/* Left — Portal info */}
        <Stack gap={2} visibleFrom="sm">
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            style={{ letterSpacing: "0.22em", color: "var(--mantine-color-blue-6)" }}
          >
            MedCare Portal
          </Text>
          <Text size="lg" fw={700} c="dark.8" lh={1.2}>
            Chăm sóc sức khỏe số cho bệnh nhân
          </Text>
        </Stack>

        {/* Mobile — just show logo text */}
        <Text fw={700} size="md" c="blue" hiddenFrom="sm">
          MedCare
        </Text>

        {/* Right — Actions */}
        <Group gap="sm" wrap="nowrap">
          {/* Bell */}
          <ActionIcon
            variant="default"
            size="lg"
            radius="md"
            aria-label="Thông báo"
            visibleFrom="md"
          >
            <Bell size={18} />
          </ActionIcon>

          {/* User menu */}
          <Menu shadow="md" width={200} radius="md" withinPortal>
            <Menu.Target>
              <Button
                variant="default"
                radius="xl"
                px="sm"
                rightSection={<ChevronDown size={14} />}
                visibleFrom="md"
                styles={{ inner: { gap: 8 } }}
              >
                <Group gap="xs" wrap="nowrap">
                  <Avatar color="blue" radius="xl" size="sm">
                    {initials}
                  </Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" fw={700} truncate>{displayName}</Text>
                    <Group gap={4}>
                      <ShieldCheck size={11} color="var(--mantine-color-blue-6)" />
                      <Badge size="xs" color="blue" variant="light">{roleLabel}</Badge>
                    </Group>
                  </Box>
                </Group>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{displayName}</Menu.Label>
              <Menu.Item
                leftSection={<LogOut size={14} />}
                color="red"
                disabled={isPending}
                onClick={logout}
              >
                Đăng xuất
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Mobile logout button */}
          <Button
            size="xs"
            variant="light"
            color="red"
            radius="md"
            disabled={isPending}
            onClick={logout}
            hiddenFrom="md"
          >
            Đăng xuất
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
