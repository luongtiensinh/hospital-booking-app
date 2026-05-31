const express = require("express");
const router = express.Router();
const supabaseClient = require("../utils/supabaseClient");

// GET /api/counters
router.get("/", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);

  const { data, error } = await supabase
    .from("counters")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({ success: true, counters: data || [] });
});

module.exports = router;
