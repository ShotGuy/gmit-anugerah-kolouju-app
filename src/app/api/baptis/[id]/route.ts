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

  const baptis = await prisma.baptis.findUnique({
    where: { idBaptis: id },
    include: includeOptions,
  });

  if (!baptis) {
    throw new NotFoundError("Data baptis tidak ditemukan");
  }

  return NextResponse.json(createResponse(true, baptis));
});

export const PATCH = withErrorHandling(async (request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const updated = await prisma.baptis.update({
    where: { idBaptis: id },
    data: parsed.data,
    include: includeOptions,
  });

  return NextResponse.json(
    createResponse(true, updated, "Data baptis diperbarui"),
  );
});

export const DELETE = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };

  await prisma.baptis.delete({
    where: { idBaptis: id },
  });

  return NextResponse.json(createResponse(true, null, "Data dihapus"));
});

