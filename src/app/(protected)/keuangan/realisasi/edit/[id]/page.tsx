import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/layout/PageHeader";
import { RealisasiForm } from "@/components/keuangan/realisasi-form";
import { notFound } from "next/navigation";
import { getRealisasiById } from "@/actions/keuangan/realisasi";

export default async function EditRealisasiPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch Data
    const [realisasiRes, periodes, kategoris, akunKasList] = await Promise.all([
        getRealisasiById(id),
        (prisma as any).periodeAnggaran.findMany({
            where: { isActive: true },
            orderBy: { tahun: "desc" }
        }),
        (prisma as any).kategoriKeuangan.findMany({
            where: { isActive: true },
            orderBy: { kode: "asc" }
        }),
        (prisma as any).akunKas.findMany({
            where: { isActive: true },
            orderBy: { isDefault: "desc" }
        })
    ]);

    if (!realisasiRes.success || !realisasiRes.data) {
        return notFound();
    }

    const initialData = realisasiRes.data;

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <PageHeader
                title="Edit Realisasi Keuangan"
                description={`Edit transaksi realisasi untuk: ${initialData.itemKeuangan?.nama}`}
                breadcrumb={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Keuangan", href: "/keuangan" },
                    { label: "Realisasi", href: "/keuangan/realisasi" },
                    { label: "Edit Transaksi" },
                ]}
            />

            <RealisasiForm
                periodes={JSON.parse(JSON.stringify(periodes))}
                kategoris={JSON.parse(JSON.stringify(kategoris))}
                akunKasList={JSON.parse(JSON.stringify(akunKasList))}
                initialData={JSON.parse(JSON.stringify(initialData))}
            />
        </div>
    );
}
