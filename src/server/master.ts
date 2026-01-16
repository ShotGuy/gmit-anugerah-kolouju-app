import { NextResponse } from "next/server";
import { z } from "zod";

import { createResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-handler";
import { AppError, NotFoundError } from "@/lib/errors";
import { generateId } from "@/lib/id";
import { prisma } from "@/lib/prisma";

type MasterKey =
  | "pendidikan"
  | "pekerjaan"
  | "pendapatan"
  | "jaminan-kesehatan"
  | "status-dalam-keluarga"
  | "status-kepemilikan-rumah"
  | "status-tanah"
  | "rayon"
  | "jabatan"
  | "provinsi"
  | "kota-kabupaten"
  | "kecamatan"
  | "kelurahan"
  | "alamat"
  | "klasis";

type PrismaModelKey =
  | "pendidikan"
  | "pekerjaan"
  | "pendapatan"
  | "jaminanKes"
  | "statusDalamKeluarga"
  | "statusKepemilikanRumah"
  | "statusTanah"
  | "rayon"
  | "jabatan"
  | "provinsi"
  | "kotaKab"
  | "kecamatan"
  | "kelurahan"
  | "alamat"
  | "klasis";

type MasterConfig = {
  model: PrismaModelKey;
  idField: string;
  idLength: number;
  searchableFields: string[];
  schema: z.ZodObject<z.ZodRawShape>;
  listInclude?: Record<string, unknown>;
};

const masterConfig: Record<MasterKey, MasterConfig> = {
  pendidikan: {
    model: "pendidikan",
    idField: "idPendidikan",
    idLength: 10,
    searchableFields: ["jenjang"],
    schema: z.object({
      idPendidikan: z.string().length(10).optional(),
      jenjang: z.string().min(2),
    }),
  },
  pekerjaan: {
    model: "pekerjaan",
    idField: "idPekerjaan",
    idLength: 10,
    searchableFields: ["namaPekerjaan"],
    schema: z.object({
      idPekerjaan: z.string().length(10).optional(),
      namaPekerjaan: z.string().min(2),
    }),
  },
  pendapatan: {
    model: "pendapatan",
    idField: "idPendapatan",
    idLength: 10,
    searchableFields: ["rentang"],
    schema: z.object({
      idPendapatan: z.string().length(10).optional(),
      rentang: z.string().min(2),
    }),
  },
  "jaminan-kesehatan": {
    model: "jaminanKes",
    idField: "idJaminan",
    idLength: 10,
    searchableFields: ["jenisJaminan"],
    schema: z.object({
      idJaminan: z.string().length(10).optional(),
      jenisJaminan: z.string().min(2),
    }),
  },
  "status-dalam-keluarga": {
    model: "statusDalamKeluarga",
    idField: "idStatusDalamKel",
    idLength: 10,
    searchableFields: ["status"],
    schema: z.object({
      idStatusDalamKel: z.string().length(10).optional(),
      status: z.string().min(2),
    }),
  },
  "status-kepemilikan-rumah": {
    model: "statusKepemilikanRumah",
    idField: "idStatusKepemilikan",
    idLength: 10,
    searchableFields: ["status"],
    schema: z.object({
      idStatusKepemilikan: z.string().length(10).optional(),
      status: z.string().min(2),
    }),
  },
  "status-tanah": {
    model: "statusTanah",
    idField: "idStatusTanah",
    idLength: 10,
    searchableFields: ["status"],
    schema: z.object({
      idStatusTanah: z.string().length(10).optional(),
      status: z.string().min(2),
    }),
  },
  rayon: {
    model: "rayon",
    idField: "idRayon",
    idLength: 10,
    searchableFields: ["namaRayon"],
    schema: z.object({
      idRayon: z.string().length(10).optional(),
      namaRayon: z.string().min(2).max(20),
    }),
  },
  jabatan: {
    model: "jabatan",
    idField: "idJabatan",
    idLength: 10,
    searchableFields: ["namaJabatan"],
    schema: z.object({
      idJabatan: z.string().length(10).optional(),
      namaJabatan: z.string().min(2).max(20),
    }),
  },
  provinsi: {
    model: "provinsi",
    idField: "idProv",
    idLength: 10,
    searchableFields: ["nama"],
    schema: z.object({
      idProv: z.string().length(10).optional(),
      nama: z.string().min(2).max(50),
    }),
  },
  "kota-kabupaten": {
    model: "kotaKab",
    idField: "idKotaKab",
    idLength: 10,
    searchableFields: ["nama"],
    schema: z.object({
      idKotaKab: z.string().length(10).optional(),
      idProv: z.string().length(10),
      nama: z.string().min(2).max(50),
    }),
    listInclude: {
      provinsi: true,
    },
  },
  kecamatan: {
    model: "kecamatan",
    idField: "idKec",
    idLength: 10,
    searchableFields: ["nama"],
    schema: z.object({
      idKec: z.string().length(10).optional(),
      idKotaKab: z.string().length(10),
      nama: z.string().min(2).max(50),
    }),
    listInclude: {
      kotaKab: true,
    },
  },
  kelurahan: {
    model: "kelurahan",
    idField: "idKelurahan",
    idLength: 10,
    searchableFields: ["nama"],
    schema: z.object({
      idKelurahan: z.string().length(10).optional(),
      idKec: z.string().length(10),
      nama: z.string().min(2).max(50),
    }),
    listInclude: {
      kecamatan: {
        include: {
          kotaKab: true,
        },
      },
    },
  },
  alamat: {
    model: "alamat",
    idField: "idAlamat",
    idLength: 10,
    searchableFields: ["jalan"],
    schema: z.object({
      idAlamat: z.string().length(10).optional(),
      idKelurahan: z.string().length(10),
      jalan: z.string().min(2).max(50),
      RT: z.coerce.number().int().min(0),
      RW: z.coerce.number().int().min(0),
    }),
    listInclude: {
      kelurahan: {
        include: {
          kecamatan: {
            include: {
              kotaKab: {
                include: {
                  provinsi: true,
                },
              },
            },
          },
        },
      },
    },
  },
  klasis: {
    model: "klasis",
    idField: "idKlasis",
    idLength: 10,
    searchableFields: ["nama"],
    schema: z.object({
      idKlasis: z.string().length(10).optional(),
      nama: z.string().min(2).max(50),
    }),
  },
};

const getDelegate = <K extends PrismaModelKey>(model: K): any => prisma[model];

const getConfig = (key: MasterKey) => {
  const config = masterConfig[key];

  if (!config) {
    throw new AppError("Konfigurasi master tidak ditemukan", 500);
  }

  return config;
};

export const createMasterCollectionHandlers = (key: MasterKey) => {
  const config = getConfig(key);

  const GET = withErrorHandling(async (request) => {
    const delegate = getDelegate(config.model);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);
    const skip = (page - 1) * limit;
    const isList = searchParams.get("list") === "true";

    const where = search
      ? {
          OR: config.searchableFields.map((field) => ({
            [field]: { contains: search, mode: "insensitive" },
          })),
        }
      : undefined;

    // If list=true, return simplified format for dropdowns (no pagination)
    if (isList) {
      const items = await delegate.findMany({
        where,
        orderBy: {
          [config.idField]: "asc",
        },
        include: config.listInclude,
      });

      return NextResponse.json(
        createResponse(true, {
          items,
        }),
      );
    }

    // Otherwise, return paginated format
    const [items, total] = await Promise.all([
      delegate.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [config.idField]: "asc",
        },
        include: config.listInclude,
      }),
      delegate.count({ where }),
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

  const POST = withErrorHandling(async (request) => {
    const delegate = getDelegate(config.model);
    const body = await request.json();
    const parsed = config.schema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;
    const idField = config.idField as keyof typeof data;

    if (!data[idField]) {
      (data as Record<string, unknown>)[config.idField] = generateId(
        config.idLength,
      );
    }

    const created = await delegate.create({
      data,
    });

    return NextResponse.json(
      createResponse(true, created, "Data berhasil ditambahkan"),
      { status: 201 },
    );
  });

  return { GET, POST };
};

export const createMasterDetailHandlers = (key: MasterKey) => {
  const config = getConfig(key);

  const baseSchema = config.schema;

  const GET = withErrorHandling(async (_request, { params: paramsPromise }) => {
    const delegate = getDelegate(config.model);
    const params = await paramsPromise;
    const rawId = (params as any)?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string") {
      throw new AppError("ID tidak valid", 400);
    }

    const item = await delegate.findUnique({
      where: {
        [config.idField]: id,
      },
    });

    if (!item) {
      throw new NotFoundError("Data tidak ditemukan");
    }

    return NextResponse.json(createResponse(true, item));
  });

  const PATCH = withErrorHandling(async (request, { params: paramsPromise }) => {
    const delegate = getDelegate(config.model);
    const params = await paramsPromise;
    const rawId = (params as any)?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string") {
      throw new AppError("ID tidak valid", 400);
    }

    const body = await request.json();
    const parsed = baseSchema.partial().safeParse(body);

    if (!parsed.success) {
      throw new AppError("Validasi gagal", 400, parsed.error.flatten().fieldErrors);
    }

    const exists = await delegate.findUnique({
      where: { [config.idField]: id },
    });

    if (!exists) {
      throw new NotFoundError("Data tidak ditemukan");
    }

    const updated = await delegate.update({
      where: { [config.idField]: id },
      data: parsed.data,
    });

    return NextResponse.json(
      createResponse(true, updated, "Data berhasil diperbarui"),
    );
  });

  const DELETE = withErrorHandling(async (_request, { params: paramsPromise }) => {
    const delegate = getDelegate(config.model);
    const params = await paramsPromise;
    const rawId = (params as any)?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || typeof id !== "string") {
      throw new AppError("ID tidak valid", 400);
    }

    try {
      await delegate.delete({
        where: { [config.idField]: id },
      });
      return NextResponse.json(createResponse(true, null, "Data dihapus"));
    } catch (err: any) {
      if (err?.code === 'P2003') {
        throw new AppError("Tidak dapat menghapus data karena sudah ada referensi/relasi di data lain.", 409);
      }
      throw err;
    }
  });

  return { GET, PATCH, DELETE };
};

