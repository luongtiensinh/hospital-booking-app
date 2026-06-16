/// <reference types="vitest" />
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    exclude: ['**/e2e/**', 'node_modules', 'dist'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("react-dom") ||
            id.includes("\\react\\")
          ) {
            return "react";
          }

          if (
            id.includes("react-hook-form") ||
            id.includes("@hookform") ||
            id.includes("\\zod\\")
          ) {
            return "forms";
          }

          if (
            id.includes("\\axios\\") ||
            id.includes("\\zustand\\") ||
            id.includes("@tanstack")
          ) {
            return "data";
          }

          if (id.includes("html5-qrcode") || id.includes("qrcode.react")) {
            return "qr";
          }

          if (
            id.includes("lucide-react") ||
            id.includes("class-variance-authority") ||
            id.includes("\\clsx\\") ||
            id.includes("tailwind-merge") ||
            id.includes("\\sonner\\") ||
            id.includes("@radix-ui")
          ) {
            return "ui";
          }

          return "vendor";
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
