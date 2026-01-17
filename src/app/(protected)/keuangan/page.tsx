import { getPeriodes } from "@/actions/keuangan/periode";
import { getKategoris } from "@/actions/keuangan/kategori";
import BudgetTreeClient from "./budget-tree-client";

export const metadata = {
    title: "Anggaran & Keuangan | GMIT Anugerah Koluju",
    description: "Dashboard Keuangan dan Anggaran",
};

export default async function KeuanganPage() {
    const periodes = await getPeriodes(1, 100);
    const kategoris = await getKategoris(1, 100);

    return (
        <BudgetTreeClient
            initialPeriodes={periodes.data || []}
            initialKategoris={kategoris.data || []}
        />
    );
}
