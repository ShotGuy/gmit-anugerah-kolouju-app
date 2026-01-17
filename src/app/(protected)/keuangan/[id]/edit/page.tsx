
import { redirect, notFound } from "next/navigation";

import CreateItemTree from "@/components/keuangan/create-item-tree";
import { getItemById } from "@/actions/keuangan/item";
import { prisma } from "@/lib/prisma";

interface PageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function EditItemPage({ params }: PageProps) {
    const { id } = await params;

    // Fetch Item
    const itemRes = await getItemById(id);
    if (!itemRes.success || !itemRes.data) {
        notFound();
    }
    const item = itemRes.data;

    // Fetch Context Data
    const [kategoris, periodes] = await Promise.all([
        (prisma as any).kategoriKeuangan.findMany({
            where: { isActive: true },
            orderBy: { kode: "asc" }
        }),
        (prisma as any).periodeAnggaran.findMany({
            where: { isActive: true },
            orderBy: { tahun: "desc" }
        })
    ]);

    return (
        <div className="space-y-6 container mx-auto p-6 max-w-7xl">
            {/* Reusing the Tree Editor for Edit Mode */}
            {/* Context is pre-filled from the item being edited */}
            <CreateItemTree
                initialPeriodes={periodes}
                initialKategoris={kategoris}
                defaultPeriodeId={item.periodeId}
                defaultKategoriId={item.kategoriId}
            />
        </div>
    );
}
