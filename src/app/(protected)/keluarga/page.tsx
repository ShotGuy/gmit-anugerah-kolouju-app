import KeluargaClientPage from "./client-page";
import { prisma } from "@/lib/prisma";
import {
  getRayon,
  getStatusKepemilikanRumah,
  getStatusTanah,
  getKelurahan,
} from "@/lib/cached-data";

export const dynamic = "force-dynamic";

const keluargaInclude = {
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
  jemaat: {
    include: {
      status: true,
    },
  },
};

export default async function KeluargaPage() {
  const [keluarga, rayon, statusKepemilikan, statusTanah, kelurahan] = await Promise.all([
    Promise.resolve([]),
    getRayon(),
    getStatusKepemilikanRumah(),
    getStatusTanah(),
    getKelurahan(),
  ]);

  return (
    <KeluargaClientPage
      initialData={undefined}
      masters={{
        statusKepemilikan,
        statusTanah,
        rayon,
        kelurahan,
      }}
    />
  );
}
