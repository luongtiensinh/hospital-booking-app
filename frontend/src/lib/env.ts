import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
  // Supabase vars are optional in E2E/CI environments that don't use Supabase directly
  VITE_SUPABASE_URL: z.string().default("http://localhost:54321"),
  VITE_SUPABASE_KEY: z.string().default("placeholder-anon-key"),
});

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY,
});
