function requireRole(allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(403).json({ success: false, message: 'Forbidden. Role not found.' });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ success: false, message: 'Forbidden. Access denied.' });
      }

      next();
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
  };
}

module.exports = requireRole;
