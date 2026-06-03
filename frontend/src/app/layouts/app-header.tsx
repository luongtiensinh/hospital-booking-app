import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { Bell, ChevronDown, LogOut, ShieldCheck, User } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useLogout } from "@/features/auth/hooks/use-logout";

export function AppHeader() {
  const { displayName, initials, roleLabel, role } = useAuthSession();
  const { logout, isPending } = useLogout();

  const roleColor =
    role === "admin" ? "red" : role === "doctor" ? "teal" : "blue";

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
        h={60}
        justify="space-between"
        wrap="nowrap"
      >
        {/* Left — Portal info (desktop only) */}
        <Stack gap={2} visibleFrom="lg">
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            style={{
              letterSpacing: "0.22em",
              color: "var(--mantine-color-blue-6)",
            }}
          >
            MedCare Portal
          </Text>
          <Text size="sm" fw={700} c="dark.8" lh={1.2}>
            Hệ thống quản lý khám bệnh
          </Text>
        </Stack>

        {/* Mobile left — logo + current page hint */}
        <Group gap="xs" hiddenFrom="lg">
          <Box
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--mantine-color-blue-6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text c="white" fw={800} size="sm">
              M
            </Text>
          </Box>
          <Text fw={700} size="md" c="blue.7">
            MedCare
          </Text>
        </Group>

        {/* Right — Actions */}
        <Group gap="sm" wrap="nowrap">
          {/* Bell (desktop only) */}
          <ActionIcon
            variant="default"
            size="lg"
            radius="md"
            aria-label="Thông báo"
            visibleFrom="md"
          >
            <Bell size={18} />
          </ActionIcon>

          {/* User menu — unified for both desktop and mobile */}
          <Menu shadow="lg" width={220} radius="md" withinPortal>
            <Menu.Target>
              {/* Desktop: full button with name + role badge */}
              <Group gap="sm" style={{ cursor: "pointer" }} wrap="nowrap">
                {/* Desktop version: avatar + name + chevron */}
                <Group
                  gap="xs"
                  wrap="nowrap"
                  visibleFrom="md"
                  style={{
                    background: "var(--mantine-color-gray-0)",
                    border: "1px solid var(--mantine-color-gray-2)",
                    borderRadius: 30,
                    padding: "5px 12px 5px 6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Avatar color={roleColor} radius="xl" size="sm">
                    {initials}
                  </Avatar>
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" fw={700} truncate style={{ maxWidth: 120 }}>
                      {displayName}
                    </Text>
                    <Group gap={4} wrap="nowrap">
                      <ShieldCheck
                        size={10}
                        color={`var(--mantine-color-${roleColor}-6)`}
                      />
                      <Badge size="xs" color={roleColor} variant="light">
                        {roleLabel}
                      </Badge>
                    </Group>
                  </Box>
                  <ChevronDown size={14} color="var(--mantine-color-gray-5)" />
                </Group>

                {/* Mobile version: just the avatar */}
                <Avatar
                  color={roleColor}
                  radius="xl"
                  size="md"
                  hiddenFrom="md"
                  style={{ cursor: "pointer" }}
                >
                  {initials}
                </Avatar>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              {/* User info header */}
              <Box px="sm" py="xs" mb={4}>
                <Text fw={700} size="sm" c="dark.8" truncate>
                  {displayName}
                </Text>
                <Group gap={6} mt={2}>
                  <ShieldCheck
                    size={12}
                    color={`var(--mantine-color-${roleColor}-6)`}
                  />
                  <Badge size="xs" color={roleColor} variant="light">
                    {roleLabel}
                  </Badge>
                </Group>
              </Box>
              <Menu.Divider />
              <Menu.Item leftSection={<User size={14} />} disabled>
                Hồ sơ cá nhân
              </Menu.Item>
              <Menu.Item
                leftSection={<LogOut size={14} />}
                color="red"
                disabled={isPending}
                onClick={logout}
              >
                {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Box>
  );
}
