import type { NextRequest } from "next/server";

import { parseToken, SESSION_COOKIE } from "@/lib/session-core";

export const readSessionFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await parseToken(token);
  } catch {
    return null;
  }
};

