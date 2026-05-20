require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// Cho phép React app gọi API (CORS)
app.use(cors());
app.use(express.json());

// Khởi tạo Supabase client (anon key - dùng cho các query thông thường)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Routes
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
