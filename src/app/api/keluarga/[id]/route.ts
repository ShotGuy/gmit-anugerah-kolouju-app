import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

const alamatSchema = z.object({
  idKelurahan: z.string().length(10),
  jalan: z.string().min(2).max(50),
  RT: z.coerce.number().int().min(0),
  RW: z.coerce.number().int().min(0),
});

const updateSchema = z
  .object({
    nikKepala: z.string().length(16).optional(),
    idStatusKepemilikan: z.string().length(10).optional(),
    idRayon: z.string().length(10).optional(),
    idStatusTanah: z.string().length(10).optional(),
    idAlamat: z.string().length(10).optional(),
    alamat: alamatSchema.optional(),
  })
  .partial();

const includeOptions = {
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
  statusKepemilikan: true,
  statusTanah: true,
  rayon: true,
  jemaat: true,
};

export const GET = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };

  const keluarga = await prisma.keluarga.findUnique({
    where: { idKeluarga: id },
    include: includeOptions,
  });

  if (!keluarga) {
    throw new NotFoundError("Keluarga tidak ditemukan");
  }

  return NextResponse.json(createResponse(true, keluarga));
});

export const PATCH = withErrorHandling(async (request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };

  const formData = await request.formData();

  // Handle file upload if present
  const file = formData.get("fotoKartuKeluarga") as File | null;
  let newFotoUrl = undefined;

  if (file && file.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new AppError("Tipe file harus JPG, PNG, atau PDF", 400);
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError("Ukuran file maksimal 5MB", 400);
    }
    const { uploadFile } = await import("@/lib/supabase");
    newFotoUrl = await uploadFile(file, "kartu-keluarga", "kk/");
  }

  // Parse JSON data
  const dataJson = formData.get("data");
  let payload = {};
  if (dataJson && typeof dataJson === "string") {
    payload = JSON.parse(dataJson);
  } else {
    // If no data field, maybe just updating photo? Or loose fields?
    // For consistency with POST, let's look for individual fields too if 'data' missing
    // But usually PATCH sends partial updates.
    // If data is missing and file is missing, it's an error?
    // Let's assume payload is required if not just uploading photo
    if (!file) {
      throw new AppError("Tidak ada data yang dikirim", 400);
    }
    // If only file, payload is empty object which is fine for partial validation
  }

  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.keluarga.findUnique({
    where: { idKeluarga: id },
    include: { alamat: true },
  });

  if (!existing) {
    throw new NotFoundError("Keluarga tidak ditemukan");
  }

  const data = parsed.data;
  let alamatId = data.idAlamat ?? existing.idAlamat;

  if (data.alamat) {
    if (existing.alamat) {
      await prisma.alamat.update({
        where: { idAlamat: existing.idAlamat },
        data: data.alamat,
      });
    } else {
      const newAlamat = await prisma.alamat.create({
        data: {
          idAlamat: generateId(10),
          ...data.alamat,
        },
      });
      alamatId = newAlamat.idAlamat;
    }
  }

  const updated = await prisma.keluarga.update({
    where: { idKeluarga: id },
    data: {
      ...(data.nikKepala && { nikKepala: data.nikKepala }),
      ...(alamatId && { idAlamat: alamatId }),
      ...(data.idStatusKepemilikan && {
        idStatusKepemilikan: data.idStatusKepemilikan,
      }),
      ...(data.idRayon && { idRayon: data.idRayon }),
      ...(data.idStatusTanah && { idStatusTanah: data.idStatusTanah }),
      ...(newFotoUrl && { fotoKartuKeluarga: newFotoUrl }),
    },
    include: includeOptions,
  });

  return NextResponse.json(
    createResponse(true, updated, "Keluarga diperbarui"),
  );
});

export const DELETE = withErrorHandling(async (_request, { params: paramsPromise }) => {
  const params = await paramsPromise;
  const { id } = params as { id: string };
  try {
    const keluarga = await prisma.keluarga.findUnique({
      where: { idKeluarga: id },
      select: { fotoKartuKeluarga: true },
    });

    if (keluarga?.fotoKartuKeluarga) {
      const { deleteFile } = await import("@/lib/supabase");
      await deleteFile(keluarga.fotoKartuKeluarga, "kartu-keluarga");
    }

    await prisma.keluarga.delete({
      where: { idKeluarga: id },
    });
    return NextResponse.json(createResponse(true, null, "Keluarga dihapus"));
  } catch (err: any) {
    if (err?.code === 'P2003') {
      throw new AppError("Tidak dapat menghapus data karena sudah ada referensi/relasi di data lain.", 409);
    }
    throw err;
  }
});

