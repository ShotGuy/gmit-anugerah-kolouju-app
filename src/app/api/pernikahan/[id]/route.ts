import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const updateSchema = z
  .object({
    klasis: z.string().min(2).max(50).optional(),
    tanggal: z.coerce.date().optional(),
    jemaatIds: z.array(z.string().length(16)).min(2).optional(),
  })
  .partial();

const includeOptions = {
  jemaats: true,
};

export const GET = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };

  const data = await prisma.pernikahan.findUnique({
    where: { idPernikahan: id },
    include: includeOptions,
  });

  if (!data) {
    throw new NotFoundError("Data pernikahan tidak ditemukan");
  }

  return NextResponse.json(createResponse(true, data));
});

export const PATCH = withErrorHandling(async (request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx: any) => {
    const pernikahan = await tx.pernikahan.update({
      where: { idPernikahan: id },
      data: {
        ...(data.klasis && { klasis: data.klasis }),
        ...(data.tanggal && { tanggal: data.tanggal }),
      },
      include: includeOptions,
    });

    if (data.jemaatIds) {
      await tx.jemaat.updateMany({
        where: { idPernikahan: id },
        data: { idPernikahan: null },
      });

      await tx.jemaat.updateMany({
        where: { idJemaat: { in: data.jemaatIds } },
        data: { idPernikahan: id },
      });
    }

    return pernikahan;
  });

  return NextResponse.json(
    createResponse(true, updated, "Data pernikahan diperbarui"),
  );
});

export const DELETE = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  try {
    await prisma.$transaction(async (tx: any) => {
      await tx.jemaat.updateMany({
        where: { idPernikahan: id },
        data: { idPernikahan: null },
      });
      await tx.pernikahan.delete({
        where: { idPernikahan: id },
      });
    });
    return NextResponse.json(createResponse(true, null, "Data dihapus"));
  } catch (err: any) {
    if (err?.code === 'P2003') {
      throw new AppError("Tidak dapat menghapus data karena sudah ada referensi/relasi di data lain.", 409);
    }
    throw err;
  }
});

