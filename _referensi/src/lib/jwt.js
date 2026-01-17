import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const signToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

export const verifyToken = (reqOrToken) => {
  try {
    let token;

    // If it's a request object, extract token from header
    if (reqOrToken && reqOrToken.headers) {
      const authHeader = reqOrToken.headers.authorization;
      token = getTokenFromHeader(authHeader);
    } else {
      // If it's already a token string
      token = reqOrToken;
    }

    if (!token) {
      return null;
    }

    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7);
};
