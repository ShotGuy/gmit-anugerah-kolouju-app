import { MASTER_DATASETS, MasterDataset } from "@/constants/master-datasets";
import { prisma } from "@/lib/prisma";

type DatasetLoader = () => Promise<unknown[]>;

const datasetLoaders: Record<string, DatasetLoader> = {
  pendidikan: () =>
    prisma.pendidikan.findMany({
      orderBy: { jenjang: "asc" },
    }),
  pekerjaan: () =>
    prisma.pekerjaan.findMany({
      orderBy: { namaPekerjaan: "asc" },
    }),
  pendapatan: () =>
    prisma.pendapatan.findMany({
      orderBy: { rentang: "asc" },
    }),
  "jaminan-kesehatan": () =>
    prisma.jaminanKes.findMany({
      orderBy: { jenisJaminan: "asc" },
    }),
  "status-dalam-keluarga": () =>
    prisma.statusDalamKeluarga.findMany({
      orderBy: { status: "asc" },
    }),
  "status-kepemilikan-rumah": () =>
    prisma.statusKepemilikanRumah.findMany({
      orderBy: { status: "asc" },
    }),
  "status-tanah": () =>
    prisma.statusTanah.findMany({
      orderBy: { status: "asc" },
    }),
  rayon: () =>
    prisma.rayon.findMany({
      orderBy: { namaRayon: "asc" },
    }),
  klasis: () =>
    prisma.klasis.findMany({
      orderBy: { nama: "asc" },
    }),
  jabatan: () =>
    prisma.jabatan.findMany({
      orderBy: { namaJabatan: "asc" },
    }),
  provinsi: () =>
    prisma.provinsi.findMany({
      orderBy: { nama: "asc" },
    }),
  "kota-kabupaten": () =>
    prisma.kotaKab.findMany({
      orderBy: { nama: "asc" },
      include: { provinsi: true },
    }),
  kecamatan: () =>
    prisma.kecamatan.findMany({
      orderBy: { nama: "asc" },
      include: { kotaKab: true },
    }),
  kelurahan: () =>
    prisma.kelurahan.findMany({
      orderBy: { nama: "asc" },
      include: {
        kecamatan: {
          include: {
            kotaKab: true,
          },
        },
      },
    }),
};

export const getMasterDataset = (slug: string): MasterDataset | null =>
  MASTER_DATASETS.find((dataset) => dataset.slug === slug) ?? null;

export const loadMasterDatasetItems = async (slug: string) => {
  const loader = datasetLoaders[slug];
  if (!loader) {
    // eslint-disable-next-line no-console
    console.debug(`No loader found for master dataset slug: ${slug}`);
    return [];
  }

  try {
    const items = await loader();
    // eslint-disable-next-line no-console
    console.debug(`Loaded ${Array.isArray(items) ? items.length : 0} items for dataset: ${slug}`);
    return items;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load items for dataset ${slug}:`, err);
    return [];
  }
};

