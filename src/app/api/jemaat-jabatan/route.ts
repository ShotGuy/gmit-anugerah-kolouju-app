import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  idJemaat: z.string().length(16),
  idJabatan: z.string().length(10),
  tanggalMulai: z.coerce.date(),
  tanggalBerakhir: z.coerce.date().optional(),
  catatan: z.string().max(255).optional(),
  statusAktif: z.boolean().optional(),
});

export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const idJemaat = searchParams.get("idJemaat") ?? undefined;

  const assignments = await prisma.jemaatJabatan.findMany({
    where: idJemaat ? { idJemaat } : undefined,
    orderBy: { tanggalMulai: "desc" },
    include: {
      jabatan: true,
    },
  });

  return NextResponse.json(createResponse(true, assignments));
});

export const POST = withErrorHandling(async (request) => {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;

  const created = await prisma.jemaatJabatan.create({
    data,
    include: {
      jabatan: true,
    },
  });

  return NextResponse.json(
    createResponse(true, created, "Jabatan jemaat ditambahkan"),
    { status: 201 },
  );
});

