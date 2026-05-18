require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// Cho phép React app gọi API (CORS)
app.use(cors());
app.use(express.json());

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

app.get("/api/todos", async (req, res) => {
  const { data, error } = await supabase.from("doctor_schedules").select("*");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
