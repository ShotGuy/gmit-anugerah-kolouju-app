import { getKategoris } from "@/actions/keuangan/kategori";
import KategoriKeuanganClient from "./client-page";

export const metadata = {
    title: "Kategori Keuangan | GMIT Anugerah Koluju",
    description: "Master Data Kategori Keuangan",
};

export default async function KategoriKeuanganPage() {
    const { data } = await getKategoris(1, 100);

    return <KategoriKeuanganClient initialData={data || []} />;
}
