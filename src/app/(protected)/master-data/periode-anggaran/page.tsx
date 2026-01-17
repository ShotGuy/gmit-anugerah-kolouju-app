import { getPeriodes } from "@/actions/keuangan/periode";
import PeriodeAnggaranClient from "./client-page";

export const metadata = {
    title: "Periode Anggaran | GMIT Anugerah Koluju",
    description: "Master Data Periode Anggaran",
};

export default async function PeriodeAnggaranPage() {
    const { data } = await getPeriodes(1, 100);

    return <PeriodeAnggaranClient initialData={data || []} />;
}
