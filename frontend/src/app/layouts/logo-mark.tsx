import { Box, ThemeIcon } from "@mantine/core";

export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <ThemeIcon
      size={size}
      radius="md"
      variant="filled"
      color="blue"
      style={{
        boxShadow: "0 8px 24px -6px rgba(15,111,236,0.4)",
        flexShrink: 0,
      }}
    >
      <Box
        style={{
          position: "relative",
          width: size * 0.42,
          height: size * 0.42,
          flexShrink: 0,
        }}
      >
        {/* Vertical bar */}
        <Box
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            height: "100%",
            width: "20%",
            transform: "translateX(-50%)",
            borderRadius: 99,
            background: "white",
          }}
        />
        {/* Horizontal bar */}
        <Box
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            height: "20%",
            width: "100%",
            transform: "translateY(-50%)",
            borderRadius: 99,
            background: "white",
          }}
        />
      </Box>
    </ThemeIcon>
  );
}
