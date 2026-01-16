"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import JemaatJabatanModule from "@/components/modules/jabatan/jemaat-jabatan-module";
import { getJabatanAction } from "@/actions/jabatan";

type Props = {
    initialData: any[];
    masters: {
        jemaat: Array<{ idJemaat: string; nama: string }>;
        jabatan: Array<{ idJabatan: string; namaJabatan: string }>;
    };
};

export default function JabatanClientPage({ initialData, masters }: Props) {
    const [filters, setFilters] = useState<Record<string, string>>({});

    const { data: assignments, isLoading } = useQuery({
        queryKey: ["jabatan-assignments", filters],
        queryFn: () => getJabatanAction(filters),
        initialData: Object.keys(filters).length === 0 ? initialData : undefined,
        staleTime: 1 * 60 * 1000,
    });

    return (
        <JemaatJabatanModule
            initialData={assignments || initialData}
            masters={masters}
            isLoading={isLoading}
            filters={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onResetFilters={() => setFilters({})}
        />
    );
}
