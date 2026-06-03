/**
 * Middleware phân quyền theo vai trò (Role-Based Access Control).
 *
 * Sử dụng sau requireAuth:
 *   router.get('/admin-only', requireAuth, requireRole(['admin']), handler)
 *
 * Trả về 403 Forbidden nếu role của user không thuộc danh sách allowedRoles.
 *
 * @param {string[]} allowedRoles - Mảng các role được phép truy cập.
 */
function requireRole(allowedRoles) {
  return function (req, res, next) {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Không xác định được vai trò người dùng.',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện thao tác này. Yêu cầu vai trò: ${allowedRoles.join(', ')}.`,
        requiredRoles: allowedRoles,
        currentRole: userRole,
      });
    }

    return next();
  };
}

module.exports = requireRole;
