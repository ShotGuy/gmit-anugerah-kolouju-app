
import CreateItemTree from "@/components/keuangan/create-item-tree";
import { prisma } from "@/lib/prisma";

interface PageProps {
    searchParams: Promise<{
        periodeId?: string;
        parentId?: string;
    }>
}

export default async function CreateItemPage({ searchParams }: PageProps) {
    const { periodeId } = await searchParams;

    // Fetch Data
    const kategoris = await (prisma as any).kategoriKeuangan.findMany({
        where: { isActive: true },
        orderBy: { kode: "asc" }
    });

    const periodes = await (prisma as any).periodeAnggaran.findMany({
        where: { isActive: true },
        orderBy: { tahun: "desc" }
    });

    // Note: Parent Item and specific Periode selection logic is handled inside the component or via URL.
    // The component accepts defaultPeriodeId.

    // Format breadcrumb
    const breadcrumb = [
        { label: "Admin", href: "/dashboard" },
        { label: "Keuangan", href: "/keuangan" },
        { label: "Tambah Item" },
    ];

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            <CreateItemTree
                initialPeriodes={periodes}
                initialKategoris={kategoris}
                defaultPeriodeId={periodeId}
            />
        </div>
    );
}
