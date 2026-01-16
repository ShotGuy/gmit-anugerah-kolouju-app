import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "gmit-admin-session";
export const SESSION_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  username: string;
  role: "ADMIN";
};

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a value with at least 16 characters.",
    );
  }

  return new TextEncoder().encode(secret);
};

export const createToken = async (payload: SessionPayload) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE_SECONDS}s`)
    .sign(getSecret());

export const parseToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });

  return payload as SessionPayload & {
    iat: number;
    exp: number;
  };
};

