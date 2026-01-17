import { verifyToken } from "./jwt";

// Middleware untuk endpoint public - tidak perlu autentikasi
export function publicEndpoint(handler) {
  return async (req, res) => {
    // Set CORS headers untuk endpoint public
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight
    if (req.method === "OPTIONS") {
      res.status(200).end();

      return;
    }

    // Hanya izinkan GET untuk endpoint public
    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ message: "Method not allowed on public endpoint" });
    }

    return handler(req, res);
  };
}

// Middleware untuk endpoint private - perlu autentikasi
export function privateEndpoint(handler, allowedRoles = []) {
  return async (req, res) => {
    try {
      // Ambil token dari header
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Invalid token.",
        });
      }

      // Check role jika ada batasan role
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      // Attach user info ke request
      req.user = decoded;

      return handler(req, res);
    } catch (error) {
      console.error("JWT verification error:", error);

      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }
  };
}

// Middleware untuk admin only
export function adminOnly(handler) {
  return privateEndpoint(handler, ["ADMIN", "PENDETA"]);
}

// Middleware untuk majelis dan admin
export function majelisOrAdmin(handler) {
  return privateEndpoint(handler, ["ADMIN", "MAJELIS", "PENDETA"]);
}

// Middleware untuk employee, majelis, dan admin
export function staffOnly(handler) {
  return privateEndpoint(handler, ["ADMIN", "MAJELIS", "EMPLOYEE", "PENDETA"]);
}
