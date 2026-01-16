import { NextResponse } from "next/server";

import { createResponse } from "@/lib/api-response";
import { destroySession } from "@/lib/session.server";

export const POST = async () => {
  await destroySession();

  return NextResponse.json(createResponse(true, null, "Logout berhasil"));
};

