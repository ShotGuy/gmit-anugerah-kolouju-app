"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import JemaatModule from "@/components/modules/jemaat/jemaat-module";
import { getJemaatAction } from "@/actions/jemaat";

interface JemaatClientPageProps {
    initialData: any[] | undefined;
    masters: any;
}

export default function JemaatClientPage({
    initialData,
    masters,
}: JemaatClientPageProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});

    const { data: response, isLoading, refetch } = useQuery({
        queryKey: ["jemaat", page, limit, filters, searchQuery],
        queryFn: () => getJemaatAction(page, limit, filters, searchQuery),
        // initialData logic needs update since structure changed
        placeholderData: (prev) => prev,
    });

    const items = response?.data?.map((item: any) => ({
        ...item,
        tanggalLahir: item.tanggalLahir instanceof Date
            ? item.tanggalLahir.toISOString()
            : String(item.tanggalLahir),
    })) ?? [];
    const metadata = response?.metadata ?? { total: 0, page: 1, limit: 10, totalPages: 1 };

    return (
        <JemaatModule
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
