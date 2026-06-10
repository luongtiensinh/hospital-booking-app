import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
  VITE_SUPABASE_URL: z.string().min(1),
  VITE_SUPABASE_KEY: z.string().min(1),
});

const getSupabaseUrl = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || url === "https://your-project.supabase.co") {
    return "https://rcvydgiyoamqiyngxsqv.supabase.co";
  }
  return url;
};

const getSupabaseKey = () => {
  const key = import.meta.env.VITE_SUPABASE_KEY;
  if (!key || key === "your-anon-public-key") {
    // Dùng legacy JWT anon key để hỗ trợ Supabase Realtime WebSocket
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjdnlkZ2l5b2FtcWl5bmd4c3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNzY2MDUsImV4cCI6MjA5NDY1MjYwNX0.DkMUOTuxQd7dI46SVVWULMI8Qe-lLoKK7b0BFBokLU0";
  }
  return key;
};

export const env = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  VITE_SUPABASE_URL: getSupabaseUrl(),
  VITE_SUPABASE_KEY: getSupabaseKey(),
});
