import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";
import { generateKeluargaId } from "@/lib/keluarga-service";

const alamatSchema = z.object({
  idKelurahan: z.string().length(10),
  jalan: z.string().min(2).max(50),
  RT: z.coerce.number().int().min(0),
  RW: z.coerce.number().int().min(0),
});

const createSchema = z.object({
  idKeluarga: z.string().length(16).optional(),
  noKK: z.string().length(16).regex(/^\d+$/).optional(),
  idAlamat: z.string().length(10).optional(),
  alamat: alamatSchema.optional(),
  idStatusKepemilikan: z.string().length(10),
  idRayon: z.string().length(10),
  idStatusTanah: z.string().length(10),
});

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

export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const idRayon = searchParams.get("idRayon") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const skip = (page - 1) * limit;

  const where: any = {
    ...(idRayon ? { idRayon } : {}),
    ...(search
      ? {
        OR: [
          { noKK: { contains: search, mode: "insensitive" } },
          { idKeluarga: { contains: search, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.keluarga.findMany({
      where,
      skip,
      take: limit,
      orderBy: { idKeluarga: "asc" },
      include: includeOptions,
    }),
    prisma.keluarga.count({ where }),
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
  const formData = await request.formData();

  // Extract file
  const file = formData.get("fotoKartuKeluarga") as File | null;
  let fotoUrl = null;

  if (file && file.size > 0) {
    // Basic validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      throw new AppError("Tipe file harus JPG, PNG, atau PDF", 400);
    }
    if (file.size > 1 * 1024 * 1024) { // 1MB
      throw new AppError("Ukuran file maksimal 1MB", 400);
    }

    // Upload using helper (need to import)
    const { uploadFile } = await import("@/lib/supabase");
    fotoUrl = await uploadFile(file, "kartu-keluarga", "kk/");
  }

  // Parse other fields manually from FormData
  // FormData values are strings, need to check if they exist
  const rawData: any = {};
  formData.forEach((value, key) => {
    if (key !== "fotoKartuKeluarga") {
      rawData[key] = value;
    }
  });

  // Re-construct nested object for alamat if sent as flat fields or JSON
  // For simplicity, we assume frontend sends flattened fields or we parse a specific JSON string field if complex.
  // BUT, previously it accepted a JSON payload. To support FormData, we should parse the 'data' field if sent as JSON string,
  // OR manually map fields. Let's assume frontend will append 'data' as a JSON string for complex structure, OR send individual fields.
  // A cleaner way for complex forms with text + file is: append("data", JSON.stringify(formValues)) and append("file", file).

  const dataJson = formData.get("data");
  if (!dataJson || typeof dataJson !== "string") {
    throw new AppError("Missing or invalid 'data' field", 400);
  }
  const payload = JSON.parse(dataJson);

  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;

  if (!data.idAlamat && !data.alamat) {
    throw new AppError("Alamat wajib diisi (pilih atau buat baru)", 400);
  }

  if (data.noKK) {
    const existingNoKK = await prisma.keluarga.findFirst({
      where: { noKK: data.noKK },
    });

    if (existingNoKK) {
      throw new AppError("No. Kartu Keluarga sudah terdaftar", 409);
    }
  }

  const newIdKeluarga = await generateKeluargaId(prisma, data.idRayon);

  // Check collision (just in case)
  const collision = await prisma.keluarga.findUnique({
    where: { idKeluarga: newIdKeluarga },
  });

  if (collision) {
    throw new AppError("Gagal men-generate ID unik, silakan coba lagi", 409);
  }

  let alamatId = data.idAlamat ?? null;

  if (!alamatId && data.alamat) {
    const newAlamat = await prisma.alamat.create({
      data: {
        idAlamat: generateId(10),
        ...data.alamat,
      },
    });
    alamatId = newAlamat.idAlamat;
  }

  const created = await prisma.keluarga.create({
    data: {
      idKeluarga: newIdKeluarga,
      noKK: data.noKK,
      idAlamat: alamatId!,
      idStatusKepemilikan: data.idStatusKepemilikan,
      idRayon: data.idRayon,
      idStatusTanah: data.idStatusTanah,
      fotoKartuKeluarga: fotoUrl,
    },
    include: includeOptions,
  });

  return NextResponse.json(
    createResponse(true, created, "Keluarga berhasil ditambahkan"),
    { status: 201 },
  );
});

