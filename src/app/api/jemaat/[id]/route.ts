import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const updateSchema = z
  .object({
    nama: z.string().min(2).max(50).optional(),
    jenisKelamin: z.boolean().optional(),
    tanggalLahir: z.coerce.date().optional(),
    golDarah: z.string().max(5).nullable().optional(),
    statusDalamKel: z.string().length(10).optional(),
    idPendidikan: z.string().length(10).nullable().optional(),
    idPekerjaan: z.string().length(10).nullable().optional(),
    idPendapatan: z.string().length(10).nullable().optional(),
    idJaminan: z.string().length(10).nullable().optional(),
    idPernikahan: z.string().length(10).nullable().optional(),
    idBaptis: z.string().length(10).nullable().optional(),
    idSidi: z.string().length(10).nullable().optional(),
    idKeluarga: z.string().length(16).optional(),
  })
  .partial();

const includeOptions = {
  keluarga: {
    include: {
      alamat: {
        include: {
          kelurahan: {
            include: {
              kecamatan: {
                include: {
                  kotaKab: {
                    include: { provinsi: true },
                  },
                },
              },
            },
          },
        },
      },
      rayon: true,
      statusKepemilikan: true,
      statusTanah: true,
    },
  },
  status: true,
  pendidikan: true,
  pekerjaan: true,
  pendapatan: true,
  jaminan: true,
  pernikahan: true,
  baptisOwned: true,
  sidiOwned: true,
  jabatanRel: {
    include: { jabatan: true },
  },
};

export const GET = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };

  const jemaat = await prisma.jemaat.findUnique({
    where: { idJemaat: id },
    include: includeOptions,
  });

  if (!jemaat) {
    throw new NotFoundError("Jemaat tidak ditemukan");
  }

  return NextResponse.json(createResponse(true, jemaat));
});

export const PATCH = withErrorHandling(async (request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const jemaat = await prisma.jemaat.findUnique({
    where: { idJemaat: id },
  });

  if (!jemaat) {
    throw new NotFoundError("Jemaat tidak ditemukan");
  }

  const updated = await prisma.jemaat.update({
    where: { idJemaat: id },
    data: parsed.data,
    include: includeOptions,
  });

  return NextResponse.json(
    createResponse(true, updated, "Jemaat diperbarui"),
  );
});

export const DELETE = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  try {
    await prisma.jemaat.delete({
      where: { idJemaat: id },
    });
    return NextResponse.json(createResponse(true, null, "Jemaat dihapus"));
  } catch (err: any) {
    if (err?.code === 'P2003') {
      // Prisma foreign key constraint failed
      throw new AppError("Tidak dapat menghapus data karena sudah ada referensi/relasi di data lain.", 409);
    }
    throw err;
  }
});

