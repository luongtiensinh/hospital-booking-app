import { Box, Stack, Text, UnstyledButton } from "@mantine/core";
import { NavLink, useMatch } from "react-router-dom";

import { navigationItems } from "@/shared/constants/navigation";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

type SideNavProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

export function SideNav({ compact = false, onNavigate }: SideNavProps) {
  const { role } = useAuthSession();

  const visibleItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  if (compact) {
    return (
      <Box
        component="nav"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-around",
          width: "100%",
          gap: 2,
        }}
      >
        {visibleItems.map((item) => (
          <CompactNavItem
            key={item.href + item.title}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </Box>
    );
  }

  // Desktop sidebar — full items
  return (
    <Box component="nav">
      <Stack gap={8}>
        {visibleItems.map((item) => (
          <FullNavItem
            key={item.href + item.title}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------
// Desktop sidebar item
// ---------------------------------------------------------------
function FullNavItem({
  item,
  onNavigate,
}: {
  item: (typeof navigationItems)[0];
  onNavigate?: () => void;
}) {
  const isActive = !!useMatch({ path: item.href, end: true });
  const Icon = item.icon;

  return (
    <UnstyledButton
      component={NavLink}
      to={item.href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderRadius: 12,
        padding: "10px 12px",
        width: "100%",
        background: isActive ? "var(--mantine-color-blue-6)" : "transparent",
        color: isActive ? "white" : "var(--mantine-color-gray-7)",
        fontWeight: isActive ? 600 : 500,
        transition: "all 0.15s ease",
        boxShadow: isActive ? "0 4px 14px -4px rgba(15,111,236,0.35)" : "none",
      }}
      className={!isActive ? "nav-item-inactive" : ""}
    >
      <Icon size={20} style={{ flexShrink: 0 }} />
      <Box style={{ minWidth: 0 }}>
        <Text fw={600} size="sm" style={{ lineHeight: 1.3 }}>
          {item.title}
        </Text>
        <Text size="xs" style={{ opacity: 0.72, lineHeight: 1.2 }}>
          {item.description}
        </Text>
      </Box>
    </UnstyledButton>
  );
}

// ---------------------------------------------------------------
// Mobile bottom nav item — icon + short label
// ---------------------------------------------------------------
function CompactNavItem({
  item,
  onNavigate,
}: {
  item: (typeof navigationItems)[0];
  onNavigate?: () => void;
}) {
  const isActive = !!useMatch({ path: item.href, end: true });
  const Icon = item.icon;

  return (
    <UnstyledButton
      component={NavLink}
      to={item.href}
      onClick={onNavigate}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        flex: 1,
        padding: "6px 4px",
        borderRadius: 10,
        color: isActive
          ? "var(--mantine-color-blue-6)"
          : "var(--mantine-color-gray-5)",
        fontWeight: isActive ? 700 : 500,
        transition: "all 0.15s ease",
        position: "relative",
      }}
    >
      {/* Active indicator pill */}
      {isActive && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 32,
            height: 3,
            borderRadius: "0 0 4px 4px",
            background: "var(--mantine-color-blue-6)",
          }}
        />
      )}
      <Icon
        size={22}
        style={{
          strokeWidth: isActive ? 2.5 : 1.8,
        }}
      />
      <Text
        size="10px"
        fw={isActive ? 700 : 500}
        style={{
          lineHeight: 1,
          whiteSpace: "nowrap",
          letterSpacing: isActive ? "0.01em" : "normal",
        }}
      >
        {item.shortTitle}
      </Text>
    </UnstyledButton>
  );
}
