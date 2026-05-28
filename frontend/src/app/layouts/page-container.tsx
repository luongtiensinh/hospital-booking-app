import type { PropsWithChildren } from "react";

import { Box } from "@mantine/core";

type PageContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function PageContainer({ children }: PageContainerProps) {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {children}
    </Box>
  );
}
