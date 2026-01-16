"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SakramenModule from "@/components/modules/sakramen/sakramen-module";
import { getSakramenAction } from "@/actions/sakramen";

type PaginatedData<T> = {
    data: T[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

type Props = {
    initialData: {
        baptis: PaginatedData<any> | null;
        sidi: PaginatedData<any> | null;
        pernikahan: PaginatedData<any> | null;
    };
    masters: {
        jemaat: any[];
        klasis: any[];
        rayon: any[];
    };
    initialTab?: "baptis" | "sidi" | "pernikahan";
};

export default function SakramenClientPage({ initialData, masters, initialTab = "baptis" }: Props) {
    const [activeTab, setActiveTab] = useState<"baptis" | "sidi" | "pernikahan">(initialTab);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const { data, isLoading } = useQuery({
        queryKey: ["sakramen", filters, activeTab, page, limit],
        queryFn: () => getSakramenAction(filters, activeTab, page, limit),
        // initialData is complex because it contains ALL tabs page 1.
        // If filters are empty AND page=1 AND limit=10, we can use initialData.
        initialData: (Object.keys(filters).length === 0 && page === 1 && limit === 10) ? initialData : undefined,
        staleTime: 1 * 60 * 1000,
    });

    // Helper to get current tab data safely
    const currentTabData = data ? data[activeTab] : null;

    // Reset page when filters change (except pagination itself)
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleResetFilters = () => {
        setFilters({});
        setPage(1);
    };

    // When tab changes, reset page to 1
    const handleTabChange = (val: string) => {
        setActiveTab(val as any);
        setPage(1);
    };

    return (
        <SakramenModule
            data={currentTabData?.data || []}
            metadata={currentTabData?.metadata}
            masters={masters}
            isLoading={isLoading}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
    );
}
