const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const requireAuth = require("../middleware/requireAuth");

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/**
 * Tạo địa chỉ email ảo dựa trên SĐT.
 * Email này không bao giờ được hiển thị ra ngoài — chỉ dùng nội bộ với Supabase Auth.
 */
function buildDummyEmail(phone) {
  return `${phone.trim()}@hospital.medcare`;
}

function toAuthUser(supabaseUser, profile) {
  return {
    id: supabaseUser.id,
    fullName: profile?.fullname || supabaseUser?.user_metadata?.fullname || "",
    phoneNumber: profile?.phone || "",
    cccd: profile?.cccd || "",
    role: profile?.role || "patient",
    avatarUrl: profile?.avatar_url ?? null,
  };
}

function toAuthSession(authData, profile) {
  if (!authData?.session || !authData?.user) return null;
  return {
    accessToken: authData.session.access_token,
    refreshToken: authData.session.refresh_token,
    user: toAuthUser(authData.user, profile),
  };
}

// ---------------------------------------------------------------
// POST /api/auth/register
// Body: { fullname, phone, cccd, password }
// ---------------------------------------------------------------
router.post("/register", async (req, res, next) => {
  try {
    const { fullname, phone, cccd, password } = req.body || {};

    const fullnameStr =
      typeof fullname === "string"
        ? fullname.trim()
        : String(fullname ?? "").trim();
    const phoneStr =
      typeof phone === "string" ? phone.trim() : String(phone ?? "").trim();
    const cccdStr =
      typeof cccd === "string" ? cccd.trim() : String(cccd ?? "").trim();
    const passwordStr =
      typeof password === "string" ? password : String(password ?? "");

    // --- Server-side validation ---
    const errors = {};

    if (fullnameStr.length === 0) {
      errors.fullname = "Họ tên không được để trống.";
    }

    if (phoneStr.length === 0) {
      errors.phone = "Số điện thoại không được để trống.";
    } else if (!/^[0-9]{9,11}$/.test(phoneStr)) {
      errors.phone = "Số điện thoại không hợp lệ (9–11 chữ số).";
    }

    if (cccdStr.length === 0) {
      errors.cccd = "Số CCCD không được để trống.";
    } else if (!/^[0-9]{12}$/.test(cccdStr)) {
      errors.cccd = "Số CCCD không hợp lệ (phải đúng 12 chữ số).";
    }

    if (passwordStr.length === 0) {
      errors.password = "Mật khẩu không được để trống.";
    } else if (passwordStr.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // --- Kiểm tra trùng lặp SĐT hoặc CCCD trong profiles thông qua RPC SECURITY DEFINER để tránh RLS ---
    const { data: existingProfiles, error: checkError } = await supabase.rpc(
      "check_existing_profiles",
      { phone_val: phoneStr, cccd_val: cccdStr },
    );

    if (checkError) {
      return res
        .status(500)
        .json({ success: false, message: checkError.message });
    }

    if (existingProfiles && existingProfiles.length > 0) {
      const dup = existingProfiles[0];
      if (dup.phone === phoneStr) {
        return res.status(409).json({
          success: false,
          errors: { phone: "Số điện thoại này đã được sử dụng." },
        });
      }
      if (dup.cccd === cccdStr) {
        return res.status(409).json({
          success: false,
          errors: { cccd: "Số CCCD này đã được sử dụng." },
        });
      }
    }

    // --- Tạo email ảo nội bộ ---
    const dummyEmail = buildDummyEmail(phoneStr);

    // --- Tạo tài khoản trên Supabase Auth ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dummyEmail,
      password: passwordStr,
      options: {
        data: {
          fullname: fullnameStr,
          phone: phoneStr,
          cccd: cccdStr,
          role: "patient",
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
          errors: { phone: "Số điện thoại này đã được đăng ký tài khoản." },
        });
      }
      return res
        .status(500)
        .json({ success: false, message: authError.message });
    }

    // --- Đảm bảo cccd được lưu vào bảng profiles ngay lập tức ---
    if (authData?.user?.id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          fullname: fullnameStr,
          phone: phoneStr,
          cccd: cccdStr,
          role: "patient",
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Lỗi khi tạo profile cho user mới:", profileError);
        try {
          if (supabase.auth.admin) {
            await supabase.auth.admin.deleteUser(authData.user.id);
          }
        } catch (delErr) {
          console.error(
            "Không thể xóa user auth sau khi tạo profile thất bại:",
            delErr,
          );
        }
        return res.status(500).json({
          success: false,
          message: "Lỗi tạo hồ sơ người dùng: " + profileError.message,
        });
      }
    }

    // Lấy profile vừa tạo để trả về session
    const profile = {
      fullname: fullnameStr,
      phone: phoneStr,
      cccd: cccdStr,
      role: "patient",
      avatar_url: null,
    };

    const session = toAuthSession(authData, profile);
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      session,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// POST /api/auth/login
// Body: { identifier (SĐT hoặc CCCD), password }
// ---------------------------------------------------------------
router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {};

    const identifierStr =
      typeof identifier === "string"
        ? identifier.trim()
        : String(identifier ?? "").trim();
    const passwordStr =
      typeof password === "string" ? password : String(password ?? "");

    if (identifierStr.length === 0 || passwordStr.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ SĐT/CCCD và mật khẩu.",
      });
    }

    // --- Tìm profile bằng SĐT hoặc CCCD thông qua RPC SECURITY DEFINER để tránh RLS ---
    const { data: profiles, error: profileError } = await supabase.rpc(
      "find_profile_by_identifier",
      { identifier: identifierStr },
    );

    if (profileError) {
      return res
        .status(500)
        .json({ success: false, message: profileError.message });
    }

    if (!profiles || profiles.length === 0) {
      return res.status(401).json({
        success: false,
        message:
          "Sai thông tin đăng nhập. Vui lòng kiểm tra lại SĐT/CCCD và mật khẩu.",
      });
    }

    const profile = profiles[0];

    // --- Tái tạo dummy email từ SĐT để đăng nhập qua Supabase Auth ---
    const dummyEmail = buildDummyEmail(profile.phone);

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: passwordStr,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        message:
          "Sai thông tin đăng nhập. Vui lòng kiểm tra lại SĐT/CCCD và mật khẩu.",
      });
    }

    const session = toAuthSession(authData, profile);
    if (!session) {
      return res
        .status(500)
        .json({ success: false, message: "Không thể tạo phiên đăng nhập." });
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

// ---------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------
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

    // Lấy lại profile để cập nhật role mới nhất (sử dụng client tạm thời được xác thực bằng access token mới để vượt qua RLS)
    const userClient = supabase.createAuthenticatedClient(
      data.session.access_token,
    );

    const { data: profile } = await userClient
      .from("profiles")
      .select("id, fullname, phone, cccd, role, avatar_url")
      .eq("id", data.user.id)
      .single();

    return res.json({
      success: true,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: toAuthUser(data.user, profile),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------
// GET /api/auth/profile
// ---------------------------------------------------------------
router.get("/profile", requireAuth, async (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      fullName: req.user.fullname,
      phoneNumber: req.user.phone,
      cccd: req.user.cccd,
      role: req.user.role,
      avatarUrl: req.user.avatarUrl,
    },
  });
});

// ---------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------
router.post("/logout", (_req, res) => {
  // Với JWT stateless, client xóa token là đủ.
  return res.status(204).send();
});

module.exports = router;
