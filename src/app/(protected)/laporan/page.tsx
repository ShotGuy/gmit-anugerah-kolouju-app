import { getMasterDataAction } from "@/actions/master-data";
import ReportClientPage from "@/components/modules/laporan/report-client-page";

export default async function ReportPage() {
    const [rayon, pendidikan, pekerjaan, status] = await Promise.all([
        getMasterDataAction("rayon"),
        getMasterDataAction("pendidikan"),
        getMasterDataAction("pekerjaan"),
        getMasterDataAction("status-dalam-keluarga"),
    ]);

    return (
        <ReportClientPage
            masters={{
                rayon: rayon as any[],
                pendidikan: pendidikan as any[],
                pekerjaan: pekerjaan as any[],
                status: status as any[],
            }}
        />
    );
}
