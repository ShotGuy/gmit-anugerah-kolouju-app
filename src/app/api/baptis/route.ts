import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  idBaptis: z.string().length(10).optional(),
  idJemaat: z.string().length(16),
  idKlasis: z.string().length(10),
  tanggal: z.coerce.date(),
});

const includeOptions = {
  jemaat: {
    select: {
      idJemaat: true,
      nama: true,
      keluarga: {
        select: {
          noKK: true,
          rayon: true,
        },
      },
    },
  },
  klasis: true,
};

export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";

  const where: any = search
    ? {
      OR: [
        {
          jemaat: {
            is: {
              nama: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          idBaptis: { contains: search, mode: "insensitive" },
        },
      ],
    }
    : undefined;

  const items = await prisma.baptis.findMany({
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

  const jemaat = await prisma.jemaat.findUnique({
    where: { idJemaat: data.idJemaat },
  });

  if (!jemaat) {
    throw new NotFoundError("Jemaat tidak ditemukan");
  }

  const existing = await prisma.baptis.findFirst({
    where: { idJemaat: data.idJemaat },
  });

  if (existing) {
    throw new AppError("Jemaat sudah memiliki data baptis", 409);
  }

  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const baptis = await tx.baptis.create({
      data: {
        ...data,
        idBaptis: data.idBaptis ?? generateId(10),
      },
    });

    await tx.jemaat.update({
      where: { idJemaat: data.idJemaat },
      data: { idBaptis: baptis.idBaptis },
    });

    return tx.baptis.findUnique({
      where: { idBaptis: baptis.idBaptis },
      include: includeOptions,
    });
  });

  return NextResponse.json(
    createResponse(true, created, "Data baptis ditambahkan"),
    { status: 201 },
  );
});

