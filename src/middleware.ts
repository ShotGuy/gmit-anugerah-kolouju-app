import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { createResponse } from "@/lib/api-response";
import { readSessionFromRequest } from "@/lib/session.middleware";

const PUBLIC_PATHS = [
  /^\/login/,
  /^\/api\/auth\/login/,
  /^\/api\/auth\/logout/,
  /^\/_next\//,
  /^\/favicon\.ico$/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((regex) => regex.test(pathname));
  const session = await readSessionFromRequest(request);

  if (isPublic) {
    if (pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        createResponse(false, null, "Unauthorized"),
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};

