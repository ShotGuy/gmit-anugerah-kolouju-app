"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type FilterOption = {
    label: string;
    value: string;
};

export type FilterConfig = {
    key: string;
    label: string;
    options: FilterOption[];
};

interface DataFilterProps {
    filters: FilterConfig[];
    values: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onReset: () => void;
}

export function DataFilter({
    filters,
    values,
    onFilterChange,
    onReset,
}: DataFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    const activeFilterCount = Object.values(values || {}).filter(
        (v) => v && v !== "all"
    ).length;

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filter Data
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>

                {isOpen && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-muted-foreground"
                    >
                        Tutup Filter
                    </Button>
                )}
            </div>

            {isOpen && (
                <div className="rounded-lg border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {filters.map((filter) => (
                            <div key={filter.key} className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    {filter.label}
                                </label>
                                <Select
                                    value={values?.[filter.key] || "all"}
                                    onValueChange={(val) => onFilterChange(filter.key, val)}
                                >
                                    <SelectTrigger className="h-8 w-full text-xs">
                                        <SelectValue placeholder={`Semua ${filter.label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua {filter.label}</SelectItem>
                                        {filter.options.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                            disabled={activeFilterCount === 0}
                        >
                            <X className="mr-2 h-3 w-3" />
                            Reset Filter
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
