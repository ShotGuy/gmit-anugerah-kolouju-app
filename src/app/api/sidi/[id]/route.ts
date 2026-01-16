import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const updateSchema = z
  .object({
    idJemaat: z.string().length(16).optional(),
    idKlasis: z.string().length(10).optional(),
    tanggal: z.coerce.date().optional(),
  })
  .partial();

const includeOptions = {
  jemaat: true,
  klasis: true,
};

export const GET = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };

  const sidi = await prisma.sidi.findUnique({
    where: { idSidi: id },
    include: includeOptions,
  });

  if (!sidi) {
    throw new NotFoundError("Data sidi tidak ditemukan");
  }

  return NextResponse.json(createResponse(true, sidi));
});

export const PATCH = withErrorHandling(async (request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const updated = await prisma.sidi.update({
    where: { idSidi: id },
    data: parsed.data,
    include: includeOptions,
  });

  return NextResponse.json(
    createResponse(true, updated, "Data sidi diperbarui"),
  );
});

export const DELETE = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  try {
    await prisma.sidi.delete({
      where: { idSidi: id },
    });
    return NextResponse.json(createResponse(true, null, "Data dihapus"));
  } catch (err: any) {
    if (err?.code === 'P2003') {
      throw new AppError("Tidak dapat menghapus data karena sudah ada referensi/relasi di data lain.", 409);
    }
    throw err;
  }
});

