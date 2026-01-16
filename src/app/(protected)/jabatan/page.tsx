import JabatanClientPage from "./client-page";
import { prisma } from "@/lib/prisma";
import { getJabatan } from "@/lib/cached-data";

export const dynamic = "force-dynamic";

export default async function JabatanPage() {
  const [assignments, jemaat, jabatan] = await Promise.all([
    prisma.jemaatJabatan.findMany({
      orderBy: { tanggalMulai: "desc" },
      include: {
        jabatan: true,
      },
    }),
    prisma.jemaat.findMany({
      orderBy: { nama: "asc" },
      select: {
        idJemaat: true,
        nama: true,
      },
      take: 200,
    }),
    getJabatan(),
  ]);

  const serializedAssignments = assignments.map((a) => ({
    ...a,
    tanggalMulai: a.tanggalMulai instanceof Date ? a.tanggalMulai.toISOString() : String(a.tanggalMulai),
    tanggalBerakhir: a.tanggalBerakhir
      ? a.tanggalBerakhir instanceof Date
        ? a.tanggalBerakhir.toISOString()
        : String(a.tanggalBerakhir)
      : null,
  }));

  return (
    <JabatanClientPage
      initialData={serializedAssignments}
      masters={{
        jemaat,
        jabatan,
      }}
    />
  );
}
