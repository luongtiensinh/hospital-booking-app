import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import { NavLink, useMatch } from "react-router-dom";

import { navigationItems } from "@/shared/constants/navigation";

type SideNavProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

export function SideNav({ compact = false, onNavigate }: SideNavProps) {
  return (
    <Box component="nav">
      <Group
        gap={compact ? "xs" : 4}
        justify={compact ? "center" : "flex-start"}
        wrap={compact ? "nowrap" : "wrap"}
      >
        {navigationItems.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            compact={compact}
            onNavigate={onNavigate}
          />
        ))}
      </Group>
    </Box>
  );
}

function NavItemLink({
  item,
  compact,
  onNavigate,
}: {
  item: (typeof navigationItems)[0];
  compact: boolean;
  onNavigate?: () => void;
}) {
  const isActive = !!useMatch({ path: item.href, end: item.href === "/" });
  const Icon = item.icon;

  return (
    <UnstyledButton
      component={NavLink}
      to={item.href}
      onClick={onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 0 : 12,
        justifyContent: compact ? "center" : "flex-start",
        borderRadius: 12,
        padding: compact ? "10px 14px 12px 14px" : "12px 14px",
        minWidth: compact ? 52 : "100%",
        flex: compact ? 1 : undefined,
        background: isActive ? "var(--mantine-color-blue-6)" : "transparent",
        color: isActive ? "white" : "var(--mantine-color-gray-6)",
        fontWeight: isActive ? 600 : 500,
        fontSize: 14,
        transition: "all 0.15s ease",
        boxShadow: isActive ? "0 4px 14px -4px rgba(15,111,236,0.35)" : "none",
      }}
      className={!isActive ? "nav-item-inactive" : ""}
    >
      <Icon size={24} style={{ flexShrink: 0 }} />
      {!compact && (
        <Box style={{ minWidth: 0 }}>
          <Text fw={600} size="sm" style={{ lineHeight: 1.3 }}>
            {item.title}
          </Text>
          <Text size="xs" style={{ opacity: 0.75, lineHeight: 1.3 }}>
            {item.description}
          </Text>
        </Box>
      )}
    </UnstyledButton>
  );
}
