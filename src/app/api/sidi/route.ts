import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  idSidi: z.string().length(10).optional(),
  idJemaat: z.string().length(16),
  idKlasis: z.string().length(10),
  tanggal: z.coerce.date(),
});

const includeOptions = {
  jemaat: true,
  klasis: true,
};

export const GET = withErrorHandling(async () => {
  const items = await prisma.sidi.findMany({
    orderBy: { tanggal: "desc" },
    include: includeOptions,
  });

  return NextResponse.json(createResponse(true, items));
});

export const POST = withErrorHandling(async (request) => {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;

  const jemaat = await prisma.jemaat.findUnique({
    where: { idJemaat: data.idJemaat },
  });

  if (!jemaat) {
    throw new NotFoundError("Jemaat tidak ditemukan");
  }

  const existing = await prisma.sidi.findFirst({
    where: { idJemaat: data.idJemaat },
  });

  if (existing) {
    throw new AppError("Jemaat sudah memiliki data sidi", 409);
  }

  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const sidi = await tx.sidi.create({
      data: {
        ...data,
        idSidi: data.idSidi ?? generateId(10),
      },
    });

    await tx.jemaat.update({
      where: { idJemaat: data.idJemaat },
      data: { idSidi: sidi.idSidi },
    });

    return tx.sidi.findUnique({
      where: { idSidi: sidi.idSidi },
      include: includeOptions,
    });
  });

  return NextResponse.json(
    createResponse(true, created, "Data sidi ditambahkan"),
    { status: 201 },
  );
});

