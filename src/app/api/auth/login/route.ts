import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { attachSessionCookie, createSession } from "@/lib/session.server";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});

export const POST = async (request: Request) => {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      createResponse(false, null, "Invalid credentials", {
        username: errors.username?.[0] ?? "",
        password: errors.password?.[0] ?? "",
      }),
      { status: 400 },
    );
  }

  // Rate Limiting Security
  // Get IP (naive approach for Node/Next)
  const ip = request.headers.get("x-forwarded-for") ?? "unknown-ip";
  const { success } = checkRateLimit(ip, { limit: 5, windowMs: 60 * 1000 }); // 5 attempts per minute

  if (!success) {
    return NextResponse.json(
      createResponse(false, null, "Terlalu banyak percobaan login. Silakan tunggu 1 menit."),
      { status: 429 },
    );
  }

  const { username, password } = parsed.data;
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      createResponse(false, null, "Username atau password salah"),
      { status: 401 },
    );
  }

  const { token, expires } = await createSession(username);
  await attachSessionCookie(token, expires);

  return NextResponse.json(
    createResponse(true, { username }, "Login berhasil"),
  );
};

