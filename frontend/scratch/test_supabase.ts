// test_supabase.ts – quick check of Supabase connection
import { supabase } from "../src/lib/supabaseClient";

(async () => {
  try {
    const { data, error } = await supabase.from("doctors").select("id, full_name").limit(1);
    if (error) {
      console.error("Supabase query error:", error);
      process.exit(1);
    }
    console.log("Supabase connection OK. Sample data:", data);
  } catch (e) {
    console.error("Unexpected error:", e);
    process.exit(1);
  }
})();
