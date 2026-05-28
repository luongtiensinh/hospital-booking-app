const supabase = require('../utils/supabaseClient');

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

  return token.trim();
}

async function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Thiếu access token hợp lệ.',
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      if (error) {
        // Keep this noisy logging only for local debugging.
        // It helps identify mismatched Supabase URL/keys or malformed JWTs.
        console.error('[requireAuth] supabase.auth.getUser error:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.',
        detail: error?.message,
      });
    }

    req.user = data.user;
    req.accessToken = token;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.',
    });
  }
}

module.exports = requireAuth;
