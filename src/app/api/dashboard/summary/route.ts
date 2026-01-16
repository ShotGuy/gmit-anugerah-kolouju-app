import { NextResponse } from "next/server";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandling(async () => {
  const [jemaat, keluarga, baptis, pernikahan] = await Promise.all([
    prisma.jemaat.count(),
    prisma.keluarga.count(),
    prisma.baptis.count(),
    prisma.pernikahan.count(),
  ]);

  return NextResponse.json(
    createResponse(true, {
      jemaat,
      keluarga,
      baptis,
      pernikahan,
    }),
  );
});

