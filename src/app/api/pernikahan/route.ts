import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  idPernikahan: z.string().length(10).optional(),
  klasis: z.string().min(2).max(50),
  tanggal: z.coerce.date(),
  jemaatIds: z.array(z.string().length(16)).min(2),
});

const includeOptions = {
  jemaats: true,
};

export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const where: Prisma.PernikahanWhereInput | undefined = search
    ? {
      OR: [
        { klasis: { contains: search, mode: "insensitive" } },
        {
          jemaats: {
            some: { nama: { contains: search, mode: "insensitive" } },
          },
        },
      ],
    }
    : undefined;

  const items = await prisma.pernikahan.findMany({
    where,
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

  const alreadyMarried = await prisma.jemaat.findMany({
    where: {
      idJemaat: { in: data.jemaatIds },
      idPernikahan: { not: null },
    },
    select: { nama: true },
  });

  if (alreadyMarried.length > 0) {
    throw new AppError(
      `Jemaat sudah menikah: ${alreadyMarried.map((j) => j.nama).join(", ")}`,
      409,
    );
  }

  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const pernikahan = await tx.pernikahan.create({
      data: {
        idPernikahan: data.idPernikahan ?? generateId(10),
        klasis: data.klasis,
        tanggal: data.tanggal,
      },
    });

    await tx.jemaat.updateMany({
      where: { idJemaat: { in: data.jemaatIds } },
      data: { idPernikahan: pernikahan.idPernikahan },
    });

    return tx.pernikahan.findUnique({
      where: { idPernikahan: pernikahan.idPernikahan },
      include: includeOptions,
    });
  });

  return NextResponse.json(
    createResponse(true, created, "Data pernikahan ditambahkan"),
    { status: 201 },
  );
});

