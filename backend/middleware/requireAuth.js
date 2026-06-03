const supabase = require("../utils/supabaseClient");

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim();
}

/**
 * Xác thực Bearer token, sau đó gắn thông tin profile (role, fullname, phone, cccd)
 * vào req.user. Trả về 401 nếu token không hợp lệ.
 */
async function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Thiếu access token hợp lệ.",
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      if (error) {
        console.error("[requireAuth] supabase.auth.getUser error:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
      }
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn.",
        detail: error?.message,
      });
    }

    // Lấy thông tin profile thực tế từ bảng public.profiles (bao gồm role)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, fullname, phone, role, cccd, avatar_url")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "[requireAuth] profile fetch error:",
        profileError?.message,
      );
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng.",
      });
    }

    // Gắn thông tin profile vào req.user để các route sử dụng
    req.user = {
      id: data.user.id,
      email: data.user.email,
      fullname: profile.fullname,
      phone: profile.phone,
      cccd: profile.cccd,
      role: profile.role || "patient",
      avatarUrl: profile.avatar_url,
    };
    req.accessToken = token;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
}

module.exports = requireAuth;
