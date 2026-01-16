import { cookies } from "next/headers";

import { createToken, parseToken, SESSION_AGE_SECONDS, SESSION_COOKIE } from "@/lib/session-core";

export const createSession = async (username: string) => {
  const token = await createToken({ username, role: "ADMIN" });
  const expires = new Date(Date.now() + SESSION_AGE_SECONDS * 1000);

  return { token, expires };
};

export const attachSessionCookie = async (token: string, expires: Date) => {
  const store = await cookies();

  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
};

export const destroySession = async () => {
  const store = await cookies();

  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
};

export const readSession = async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await parseToken(token);
  } catch {
    return null;
  }
};


export const verifySession = async () => {
  const session = await readSession();
  if (!session) {
    throw new Error("Unauthorized: Session is invalid or expired.");
  }
  return session;
};
