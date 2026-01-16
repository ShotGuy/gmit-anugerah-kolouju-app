"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReportStats, type ReportFilters as ReportFiltersType } from "@/actions/report";
import { ReportFilters } from "./report-filters";
import { ReportCharts } from "./report-charts";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";

type Props = {
    masters: {
        rayon: any[];
        pendidikan: any[];
        pekerjaan: any[];
        status: any[];
    };
};

export default function ReportClientPage({ masters }: Props) {
    const [filters, setFilters] = useState<ReportFiltersType>({});

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ["report-stats", filters],
        queryFn: () => getReportStats(filters),
        placeholderData: (prev) => prev,
    });

    const handleFilterChange = (newFilters: ReportFiltersType) => {
        setFilters(newFilters);
    };

    const handleReset = () => {
        setFilters({});
    };

    return (
        <div className="space-y-6 container mx-auto py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan & Statistik</h1>
                    <p className="text-muted-foreground">Analisis data jemaat dan gereja secara real-time.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>

            <ReportFilters
                rayons={masters.rayon}
                statuses={masters.status}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
            />

            {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : isError || !data?.success ? (
                <div className="h-64 flex flex-col items-center justify-center text-destructive bg-destructive/10 rounded-lg">
                    <p className="font-semibold">Gagal memuat data laporan.</p>
                    <Button variant="link" onClick={() => refetch()}>Coba Lagi</Button>
                </div>
            ) : (
                data.data && <ReportCharts data={data.data} masters={masters} />
            )}
        </div>
    );
}
