import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { generateKeluargaId } from "@/lib/keluarga-service";

const keluargaBaruSchema = z.object({
  noKK: z.string().length(16).regex(/^\d+$/),
  idStatusKepemilikan: z.string().length(10),
  idRayon: z.string().length(10),
  idStatusTanah: z.string().length(10),
  alamat: z.object({
    idKelurahan: z.string().length(10),
    jalan: z.string().min(2).max(50),
    RT: z.coerce.number().int().min(0),
    RW: z.coerce.number().int().min(0),
  }),
});

const jemaatSchema = z.object({
  idJemaat: z.string().length(16),
  nama: z.string().min(2).max(50),
  jenisKelamin: z.boolean(),
  tanggalLahir: z.coerce.date(),
  golDarah: z.string().max(5).nullable().optional(),
  statusDalamKel: z.string().length(10),
  idPendidikan: z.string().length(10).nullable().optional(),
  idPekerjaan: z.string().length(10).nullable().optional(),
  idPendapatan: z.string().length(10).nullable().optional(),
  idJaminan: z.string().length(10).nullable().optional(),
  idPernikahan: z.string().length(10).nullable().optional(),
  idBaptis: z.string().length(10).nullable().optional(),
  idSidi: z.string().length(10).nullable().optional(),
});

const createSchema = jemaatSchema.extend({
  idKeluarga: z.string().length(16).optional(),
  noKK: z.string().length(16).regex(/^\d+$/).optional(),
  keluargaBaru: keluargaBaruSchema.optional(),
});

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
    include: {
      jabatan: true,
    },
  },
};

const resolveKeluargaId = async (
  payload: z.infer<typeof createSchema>,
  tx: Prisma.TransactionClient,
  fotoKartuKeluarga?: string | null,
) => {
  if (payload.idKeluarga) {
    return payload.idKeluarga;
  }

  if (payload.noKK) {
    const keluarga = await tx.keluarga.findUnique({
      where: { noKK: payload.noKK },
      select: { idKeluarga: true },
    });

    if (!keluarga) {
      throw new NotFoundError("Keluarga dengan No. KK tersebut tidak ditemukan");
    }

    return keluarga.idKeluarga;
  }

  if (payload.keluargaBaru) {
    const alamat = await tx.alamat.create({
      data: {
        idAlamat: generateId(10),
        ...payload.keluargaBaru.alamat,
      },
    });
    // Ensure noKK is not already registered (unique constraint)
    const existing = await tx.keluarga.findUnique({
      where: { noKK: payload.keluargaBaru.noKK },
      select: { idKeluarga: true },
    });

    if (existing) {
      // No need to manually delete alamat, transaction rollback will handle it
      throw new AppError("No. Kartu Keluarga sudah terdaftar", 409);
    }

    // ID Generation Logic for Jemaat Creation
    const newIdKeluarga = await generateKeluargaId(tx, payload.keluargaBaru.idRayon);

    const keluarga = await tx.keluarga.create({
      data: {
        idKeluarga: newIdKeluarga,
        noKK: payload.keluargaBaru.noKK,
        idAlamat: alamat.idAlamat,
        idStatusKepemilikan: payload.keluargaBaru.idStatusKepemilikan,
        idRayon: payload.keluargaBaru.idRayon,
        idStatusTanah: payload.keluargaBaru.idStatusTanah,
        fotoKartuKeluarga: fotoKartuKeluarga,
      },
    });

    return keluarga.idKeluarga;
  }

  throw new AppError("Informasi keluarga tidak lengkap", 400);
};

export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const skip = (page - 1) * limit;

  const where: any = search
    ? {
      OR: [
        { nama: { contains: search, mode: "insensitive" } },
        { idJemaat: { contains: search, mode: "insensitive" } },
      ],
    }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.jemaat.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nama: "asc" },
      include: includeOptions,
    }),
    prisma.jemaat.count({ where }),
  ]);

  return NextResponse.json(
    createResponse(true, {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }),
  );
});

export const POST = withErrorHandling(async (request) => {
  // Handle FormData for file upload
  let payload: any;
  let fotoUrl: string | null = null;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    // Extract file
    const file = formData.get("fotoKartuKeluarga") as File | null;
    if (file && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        throw new AppError("Tipe file harus JPG, PNG, atau PDF", 400);
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new AppError("Ukuran file maksimal 5MB", 400);
      }

      const { uploadFile } = await import("@/lib/supabase");
      fotoUrl = await uploadFile(file, "kartu-keluarga", "kk/");
    }

    // Extract Data JSON
    const dataJson = formData.get("data");
    if (!dataJson || typeof dataJson !== "string") {
      throw new AppError("Missing or invalid 'data' field", 400);
    }
    payload = JSON.parse(dataJson);

  } else {
    // Fallback to JSON for requests without file (though client should always use FormData now)
    payload = await request.json();
  }

  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    // If file was uploaded but validation failed, we might want to delete the file.
    // But for simplicity/MVP we skip that cleanup for now.
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    // Pass fotoUrl to resolution function
    const keluargaId = await resolveKeluargaId(data, tx, fotoUrl);

    // Build a clean payload for Prisma - exclude helper fields like nikKepalaKeluarga/keluargaBaru
    const jemaatCreatePayload: any = {
      idJemaat: data.idJemaat,
      nama: data.nama,
      jenisKelamin: data.jenisKelamin,
      tanggalLahir: data.tanggalLahir,
      golDarah: data.golDarah ?? null,
      statusDalamKel: data.statusDalamKel,
      idPendidikan: data.idPendidikan ?? null,
      idPekerjaan: data.idPekerjaan ?? null,
      idPendapatan: data.idPendapatan ?? null,
      idJaminan: data.idJaminan ?? null,
      idPernikahan: data.idPernikahan ?? null,
      idBaptis: data.idBaptis ?? null,
      idSidi: data.idSidi ?? null,
      idKeluarga: keluargaId,
    };

    return tx.jemaat.create({
      data: jemaatCreatePayload,
      include: includeOptions,
    });
  }, {
    timeout: 20000,
  });

  return NextResponse.json(
    createResponse(true, created, "Jemaat berhasil ditambahkan"),
    { status: 201 },
  );
});

