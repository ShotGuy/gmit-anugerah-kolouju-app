"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import KeluargaModule from "@/components/modules/keluarga/keluarga-module";
import { getKeluargaAction } from "@/actions/keluarga";

interface KeluargaClientPageProps {
    initialData: any[] | undefined;
    masters: any;
}

export default function KeluargaClientPage({
    initialData,
    masters,
}: KeluargaClientPageProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});

    const { data: response, isLoading, refetch } = useQuery({
        queryKey: ["keluarga", page, limit, filters, searchQuery],
        queryFn: () => getKeluargaAction(page, limit, filters, searchQuery),
        // initialData logic needs update since structure changed, setting undefined for now to force fetch
        // or we could shape initialData to match structure if server passed it
        placeholderData: (prev) => prev,
    });

    const items = response?.data ?? [];
    const metadata = response?.metadata ?? { total: 0, page: 1, limit: 10, totalPages: 1 };

    return (
        <KeluargaModule
            data={items}
            metadata={metadata}
            masters={masters}
            isLoading={isLoading}
            filters={filters}
            onFilterChange={(key, value) => {
                setFilters((prev) => ({ ...prev, [key]: value }));
                setPage(1); // Reset to page 1 on filter change
            }}
            onResetFilters={() => {
                setFilters({});
                setPage(1);
            }}
            onPageChange={setPage}
            onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
            }}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
                setSearchQuery(q);
                setPage(1);
            }}
            onDataChange={() => refetch()}
        />
    );
}
