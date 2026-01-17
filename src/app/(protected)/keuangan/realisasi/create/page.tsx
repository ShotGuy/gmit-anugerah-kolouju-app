import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/layout/PageHeader";
import { RealisasiForm } from "@/components/keuangan/realisasi-form";

export default async function CreateRealisasiPage() {
    // Fetch initial data for dropdowns
    const [periodes, kategoris] = await Promise.all([
        prisma.periodeAnggaran.findMany({
            where: { isActive: true },
            orderBy: { tahun: "desc" }
        }),
        prisma.kategoriKeuangan.findMany({
            where: { isActive: true },
            orderBy: { kode: "asc" }
        })
    ]);

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <PageHeader
                title="Tambah Realisasi Keuangan"
                description="Catat transaksi penerimaan atau pengeluaran baru."
                breadcrumb={[
                    { label: "Admin", href: "/dashboard" },
                    { label: "Keuangan", href: "/keuangan" },
                    { label: "Realisasi", href: "/keuangan/realisasi" },
                    { label: "Tambah Baru" },
                ]}
            />

            <RealisasiForm periodes={periodes} kategoris={kategoris} />
        </div>
    );
}
