const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const cookieToken = req.cookies?.bloodlinkToken || "";
  const token = bearerToken || cookieToken;

  if (!token) {
    return sendError(res, "Authentication required", 401);
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();

  if (!allowedRoles.includes(role)) {
    return sendError(res, "Forbidden", 403);
  }

  return next();
};

module.exports = {
  requireAuth,
  requireRole,
};
