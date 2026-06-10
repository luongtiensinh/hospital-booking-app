import { useEffect, useRef } from "react";
import { useQueryClient, QueryKey } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/auth-store";

let channelCounter = 0;

export function useRealtimeAppointments(queryKeys: QueryKey[]) {
  const queryClient = useQueryClient();
  const keysRef = useRef(queryKeys);
  const accessToken = useAuthStore((state) => state.accessToken);
  const channelNameRef = useRef(`appointments-changes-${++channelCounter}`);

  useEffect(() => {
    keysRef.current = queryKeys;
  }, [queryKeys]);

  useEffect(() => {
    if (!accessToken) return;

    supabase.realtime.setAuth(accessToken);

    const channel = supabase
      .channel(channelNameRef.current)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        (payload) => {
          console.log(
            "[Realtime] appointments change:",
            payload.eventType,
            payload,
          );
          keysRef.current.forEach((key) => {
            void queryClient.invalidateQueries({ queryKey: key });
          });
        },
      )
      .subscribe((status) => {
        console.log(
          `[Realtime] channel "${channelNameRef.current}" status:`,
          status,
        );
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, accessToken]);
}
