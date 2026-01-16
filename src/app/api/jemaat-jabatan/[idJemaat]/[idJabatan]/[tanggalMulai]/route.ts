import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const updateSchema = z
  .object({
    tanggalBerakhir: z.coerce.date().optional(),
    catatan: z.string().max(255).optional(),
    statusAktif: z.boolean().optional(),
  })
  .partial();

const paramsSchema = z.object({
  idJemaat: z.string().min(1),
  idJabatan: z.string().min(1),
  tanggalMulai: z.string(),
});

const parseParams = (params: Record<string, string>) => {
  const parsed = paramsSchema.safeParse(params);

  if (!parsed.success) {
    throw new AppError("Parameter tidak valid", 400);
  }

  return {
    idJemaat: parsed.data.idJemaat,
    idJabatan: parsed.data.idJabatan,
    tanggalMulai: new Date(parsed.data.tanggalMulai),
  };
};

export const PATCH = withErrorHandling(async (request, context) => {
  const params = await context.params;
  const keys = parseParams(params as Record<string, string>);
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const updated = await prisma.jemaatJabatan.update({
    where: { idJemaat_idJabatan_tanggalMulai: keys },
    data: parsed.data,
    include: {
      jabatan: true,
    },
  });

  return NextResponse.json(
    createResponse(true, updated, "Relasi jabatan diperbarui"),
  );
});

export const DELETE = withErrorHandling(async (_request, context) => {
  const params = await context.params;
  const keys = parseParams(params as Record<string, string>);

  await prisma.jemaatJabatan.delete({
    where: { idJemaat_idJabatan_tanggalMulai: keys },
  });

  return NextResponse.json(
    createResponse(true, null, "Relasi jabatan dihapus"),
  );
});

