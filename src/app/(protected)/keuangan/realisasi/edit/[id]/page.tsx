import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/layout/PageHeader";
import { RealisasiForm } from "@/components/keuangan/realisasi-form";
import { getRealisasiById } from "@/actions/keuangan/realisasi";
import { notFound } from "next/navigation";

export default async function EditRealisasiPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch initial data for dropdowns AND the realization itself
    const [periodes, kategoris, realisasiRes] = await Promise.all([
        (prisma as any).periodeAnggaran.findMany({
            where: { isActive: true },
            orderBy: { tahun: "desc" }
        }),
        (prisma as any).kategoriKeuangan.findMany({
            where: { isActive: true },
            orderBy: { kode: "asc" }
        }),
        getRealisasiById(id)
    ]);

    if (!realisasiRes.success || !realisasiRes.data) {
        notFound();
    }

    const realisasi = realisasiRes.data;

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <PageHeader
                title="Edit Transaksi Realisasi"
                description={`Mengubah data realisasi untuk item "${realisasi.itemKeuangan?.nama}".`}
                breadcrumb={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Keuangan", href: "/keuangan" },
                    { label: "Realisasi", href: "/keuangan/realisasi" },
                    { label: "Edit Transaksi" },
                ]}
            />

            <RealisasiForm
                periodes={periodes}
                kategoris={kategoris}
                initialData={realisasi}
            />
        </div>
    );
}
