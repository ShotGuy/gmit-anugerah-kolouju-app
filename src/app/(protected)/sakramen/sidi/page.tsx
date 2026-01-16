import SakramenClientPage from "../client-page";
import { prisma } from "@/lib/prisma";
import { getSakramenAction } from "@/actions/sakramen";
import { getKlasis, getRayon } from "@/lib/cached-data";

export const dynamic = "force-dynamic";

export default async function SakramenSidiPage() {
  const [data, jemaat, klasis, rayon] = await Promise.all([
    getSakramenAction(),
    prisma.jemaat.findMany({
      orderBy: { nama: "asc" },
      select: {
        idJemaat: true,
        nama: true,
        jenisKelamin: true,
      },
    }),
    getKlasis(),
    getRayon(),
  ]);

  return (
    <SakramenClientPage
      initialData={data}
      masters={{ jemaat, klasis, rayon }}
      initialTab="sidi"
    />
  );
}
