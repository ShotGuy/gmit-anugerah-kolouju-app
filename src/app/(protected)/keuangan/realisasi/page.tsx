import { getAkunKasList } from "@/actions/keuangan/akun-kas";
import { getPeriodes } from "@/actions/keuangan/periode";
import { getKategoris } from "@/actions/keuangan/kategori";
import { KasSummaryCards } from "@/components/keuangan/kas-summary-cards";
import PageHeader from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MutasiTab } from "@/components/keuangan/mutasi-tab";
import { AnggaranTab } from "@/components/keuangan/anggaran-tab";

export default async function RealisasiKeuanganPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Fetch Initial Data for Props
    const [periodesRes, kategorisRes, akunKasRes] = await Promise.all([
        getPeriodes(1, 100),
        getKategoris(1, 100),
        getAkunKasList()
    ]);

    const periodes = periodesRes.success ? periodesRes.data : [];
    const kategoris = kategorisRes.success ? kategorisRes.data : [];
    const akunKasList = akunKasRes.success ? akunKasRes.data : [];

    // 2. Determine default tab (Server side logic if needed, but Tabs handles client state mostly)
    // We pass data down to Client Components

    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6 max-w-7xl animate-in fade-in duration-500">
            {/* HIDE HEADERS ON PRINT */}
            <div className="print:hidden space-y-6">
                <PageHeader
                    title="Manajemen Realisasi & Kas"
                    description="Pusat kendali arus kas dan monitoring anggaran"
                    breadcrumb={[
                        { label: "Admin", href: "/dashboard" },
                        { label: "Keuangan", href: "/keuangan" },
                        { label: "Realisasi" },
                    ]}
                />

                {/* --- Kas Summary (Saldo) --- */}
                <KasSummaryCards akunKasList={akunKasList} />
            </div>

            {/* --- TABBED INTERFACE --- */}
            <Tabs defaultValue="mutasi" className="w-full">
                <div className="print:hidden mb-6">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="mutasi" className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Mutasi Kas / Buku Kas
                        </TabsTrigger>
                        <TabsTrigger value="anggaran" className="text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            Monitor Anggaran
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="mutasi" className="space-y-4">
                    <MutasiTab akunList={akunKasList} />
                </TabsContent>

                <TabsContent value="anggaran" className="space-y-4">
                    <AnggaranTab periodes={periodes} kategoris={kategoris} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
