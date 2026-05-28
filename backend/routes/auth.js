const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const requireAuth = require("../middleware/requireAuth");

function toAuthUser(supabaseUser) {
  const metadata = supabaseUser?.user_metadata || {};
  return {
    id: supabaseUser.id,
    fullName: metadata.fullname || metadata.fullName || "",
    email: supabaseUser.email || "",
    phoneNumber: metadata.phone || metadata.phoneNumber || "",
    role: "patient",
    avatarUrl: metadata.avatarUrl ?? null,
  };
}

function toAuthSession(authData) {
  if (!authData?.session || !authData?.user) return null;
  return {
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    user: toAuthUser(authData.user),
  };
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { fullname, email, phone, password } = req.body || {};

    // --- Ép kiểu sang string để tránh TypeError khi gọi .trim() ---
    const fullnameStr =
      typeof fullname === "string" ? fullname : String(fullname ?? "");
    const emailStr = typeof email === "string" ? email : String(email ?? "");
    const phoneStr = typeof phone === "string" ? phone : String(phone ?? "");
    const passwordStr =
      typeof password === "string" ? password : String(password ?? "");

    // --- Server-side validation ---
    const errors = {};

    if (fullnameStr.trim().length === 0) {
      errors.fullname = "Họ tên không được để trống.";
    }

    // if (emailStr.trim().length === 0) {
    //   errors.email = "Email không được để trống.";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
    //   errors.email = "Email không hợp lệ.";
    // }

    if (phoneStr.trim().length === 0) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^[0-9]{9,11}$/.test(phoneStr.trim())) {
      errors.phone = "Số điện thoại không hợp lệ (9–11 chữ số).";
    }

    if (passwordStr.length === 0) {
      errors.password = "Mật khẩu không được để trống.";
    } else if (passwordStr.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // --- Tạo tài khoản trên Supabase Auth ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: emailStr.trim(),
      password: passwordStr,
      options: {
        data: {
          fullname: fullnameStr.trim(),
          phone: phoneStr.trim(),
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
      return res
        .status(500)
        .json({ success: false, message: authError.message });
    }

    const session = toAuthSession(authData);
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // --- Ép kiểu sang string để tránh TypeError khi gọi .trim() ---
    const emailStr = typeof email === "string" ? email : String(email ?? "");
    const passwordStr =
      typeof password === "string" ? password : String(password ?? "");

    if (emailStr.trim().length === 0 || passwordStr.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: emailStr.trim(),
        password: passwordStr,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: "Sai email hoặc mật khẩu.",
      });
    }

    const session = toAuthSession(authData);
    if (!session) {
      return res
        .status(500)
        .json({ success: false, message: "Khong the tao phien dang nhap." });
    }

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken || typeof refreshToken !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu refresh token." });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data?.session || !data?.user) {
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn.",
        detail: error?.message,
      });
    }

    return res.json({
      success: true,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: toAuthUser(data.user),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/profile
router.get("/profile", requireAuth, async (req, res) => {
  return res.json({ success: true, user: toAuthUser(req.user) });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  // With stateless JWT, client can just drop tokens.
  return res.status(204).send();
});

module.exports = router;
