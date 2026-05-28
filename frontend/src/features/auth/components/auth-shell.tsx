import type { PropsWithChildren } from "react";

import { Anchor, Box, Flex, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "@/shared/constants/routes";
import { LogoMark } from "@/app/layouts/logo-mark";

type AuthShellProps = PropsWithChildren<{
  heading: string;
  description: string;
  footerText: string;
  footerActionLabel: string;
  footerActionHref: string;
}>;

export function AuthShell({
  heading,
  description,
  footerText,
  footerActionLabel,
  footerActionHref,
  children,
}: AuthShellProps) {
  return (
    <Flex mih="100vh">
      <Box
        component="section"
        flex={{ base: "1", lg: "0.95" }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <Box w="100%" maw={480}>
          <Stack gap="xl">
            {/* Logo (visible on mobile too) */}
            <Anchor
              component={Link}
              to={APP_ROUTES.login}
              underline="never"
              style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
            >
              <LogoMark />
              <Box>
                <Text fw={700} size="sm" c="dark">
                  MedCare
                </Text>
                <Text size="xs" c="dimmed">
                  Healthcare Dashboard
                </Text>
              </Box>
            </Anchor>

            {/* Card form */}
            <Paper
              p={{ base: "lg", sm: "xl" }}
              radius="xl"
              shadow="md"
              withBorder
              style={{ borderColor: "rgba(215, 228, 240, 0.8)" }}
            >
              <Stack gap="lg">
                <Box>
                  <Title order={2} size="h3" fw={700}>
                    {heading}
                  </Title>
                  <Text size="sm" c="dimmed" mt={4} lh={1.6}>
                    {description}
                  </Text>
                </Box>
                {children}
              </Stack>
            </Paper>

            <Text ta="center" size="sm" c="dimmed">
              {footerText}{" "}
              <Anchor component={Link} to={footerActionHref} fw={600}>
                {footerActionLabel}
              </Anchor>
            </Text>
          </Stack>
        </Box>
      </Box>
    </Flex>
  );
}
