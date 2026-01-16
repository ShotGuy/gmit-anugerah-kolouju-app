import JemaatClientPage from "./client-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const jemaatInclude = {
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

import {
  getStatusDalamKeluarga,
  getPendidikan,
  getPekerjaan,
  getPendapatan,
  getJaminanKes,
  getStatusKepemilikanRumah,
  getStatusTanah,
  getRayon,
} from "@/lib/cached-data";

export default async function JemaatPage() {
  const [
    jemaat,
    status,
    pendidikan,
    pekerjaan,
    pendapatan,
    jaminan,
    statusKepemilikan,
    statusTanah,
    rayon,
  ] = await Promise.all([
    // prisma.jemaat.findMany removed to enable instant navigation (Render First)
    Promise.resolve([]), // Placeholder to keep array destructuring working

    getStatusDalamKeluarga(),
    getPendidikan(),
    getPekerjaan(),
    getPendapatan(),
    getJaminanKes(),
    getStatusKepemilikanRumah(),
    getStatusTanah(),
    getRayon(),
    // getKelurahan() removed (Async)
  ]);

  const serializedJemaat = jemaat.map((j: any) => ({
    ...j,
    tanggalLahir: j.tanggalLahir instanceof Date ? j.tanggalLahir.toISOString() : String(j.tanggalLahir),
  }));

  return (
    <JemaatClientPage
      initialData={undefined}
      masters={{
        status,
        pendidikan,
        pekerjaan,
        pendapatan,
        jaminan,
        statusKepemilikan,
        statusTanah,
        rayon,
        // kelurahan removed
      }}
    />
  );
}

