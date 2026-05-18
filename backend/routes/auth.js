const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { fullname, email, phone, password } = req.body || {};

  // --- Server-side validation ---
  const errors = {};

  if (!fullname || fullname.trim().length === 0) {
    errors.fullname = "Họ tên không được để trống.";
  }

  if (!email || email.trim().length === 0) {
    errors.email = "Email không được để trống.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!phone || phone.trim().length === 0) {
    errors.phone = "Số điện thoại không được để trống.";
  } else if (!/^[0-9]{9,11}$/.test(phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ (9–11 chữ số).";
  }

  if (!password || password.length === 0) {
    errors.password = "Mật khẩu không được để trống.";
  } else if (password.length < 8) {
    errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // --- Tạo tài khoản trên Supabase Auth ---
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        fullname: fullname.trim(),
        phone: phone.trim(),
      },
    },
  });

  if (authError) {
    if (
      authError.message.toLowerCase().includes("already registered") ||
      authError.message.toLowerCase().includes("user already registered")
    ) {
      return res.status(409).json({
        success: false,
        errors: {
          email: "Email này đã được sử dụng. Vui lòng dùng email khác.",
        },
      });
    }
    return res.status(500).json({ success: false, message: authError.message });
  }

  return res.status(201).json({
    success: true,
    message: "Đăng ký thành công!",
  });
});

module.exports = router;
