/**
 * Middleware to restrict access based on user roles.
 * @param {...string} allowedRoles - List of roles permitted to access the route.
 * @returns {function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authMiddleware ran first and set req.user
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user information' });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden: Required role(s) ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};

module.exports = authorize;
