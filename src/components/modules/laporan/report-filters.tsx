"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Mock or passed Rayon data
type Rayon = { idRayon: string; namaRayon: string };
type StatusKeluarga = { idStatusDalamKel: string; status: string };

type ReportFilters = {
    rayon?: string;
    gender?: "L" | "P";
    ageMin?: number;
    ageMax?: number;
    bloodType?: string;
    maritalStatus?: string;
    // Others: Keaktifan is excluded as per request
};

type Props = {
    rayons: Rayon[];
    statuses: StatusKeluarga[];
    filters: ReportFilters;
    onFilterChange: (newFilters: ReportFilters) => void;
    onReset: () => void;
};

export function ReportFilters({ rayons, statuses, filters, onFilterChange, onReset }: Props) {
    const [openRayon, setOpenRayon] = useState(false);

    const handleChange = (key: keyof ReportFilters, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="bg-card border rounded-lg p-4 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end">

                {/* Rayon Filter */}
                <div className="flex-1 w-full min-w-[200px]">
                    <Label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Rayon</Label>
                    <Popover open={openRayon} onOpenChange={setOpenRayon}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openRayon}
                                className="w-full justify-between"
                            >
                                {filters.rayon
                                    ? rayons.find((r) => r.idRayon === filters.rayon)?.namaRayon
                                    : "Semua Rayon"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandInput placeholder="Cari rayon..." />
                                <CommandList>
                                    <CommandEmpty>Rayon tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            value="all"
                                            onSelect={() => {
                                                handleChange("rayon", undefined);
                                                setOpenRayon(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    !filters.rayon ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            Semua Rayon
                                        </CommandItem>
                                        {rayons.map((rayon) => (
                                            <CommandItem
                                                key={rayon.idRayon}
                                                value={rayon.namaRayon}
                                                onSelect={() => {
                                                    handleChange("rayon", rayon.idRayon);
                                                    setOpenRayon(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        filters.rayon === rayon.idRayon ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {rayon.namaRayon}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Gender Filter */}
                <div className="w-[150px]">
                    <Label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Jenis Kelamin</Label>
                    <Select
                        value={filters.gender || "all"}
                        onValueChange={(val) => handleChange("gender", val === "all" ? undefined : val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="L">Laki-laki</SelectItem>
                            <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Goldar Filter */}
                <div className="w-[100px]">
                    <Label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Gol. Darah</Label>
                    <Select
                        value={filters.bloodType || "all"}
                        onValueChange={(val) => handleChange("bloodType", val === "all" ? undefined : val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="AB">AB</SelectItem>
                            <SelectItem value="O">O</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Dalam Keluarga (Renamed) */}
                <div className="w-[180px]">
                    <Label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Status Dalam Keluarga</Label>
                    <Select
                        value={filters.maritalStatus || "all"}
                        onValueChange={(val) => handleChange("maritalStatus", val === "all" ? undefined : val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            {statuses?.map((status) => (
                                <SelectItem key={status.idStatusDalamKel} value={status.idStatusDalamKel}>
                                    {status.status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset Button */}
                <div>
                    <Button variant="ghost" onClick={onReset} className="text-destructive hover:bg-destructive/10">
                        Reset
                    </Button>
                </div>

            </div>

            {/* Row 2: Age Range (Optional Expandable) */}
            <div className="grid grid-cols-2 gap-4 md:w-1/3">
                <div>
                    <Label className="text-xs text-muted-foreground">Usia Min</Label>
                    <Input
                        type="number"
                        min={0}
                        max={150}
                        placeholder="0"
                        value={filters.ageMin ?? ""}
                        onChange={(e) => handleChange("ageMin", e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Usia Max</Label>
                    <Input
                        type="number"
                        min={0}
                        max={150}
                        placeholder="Max"
                        value={filters.ageMax ?? ""}
                        onChange={(e) => handleChange("ageMax", e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
            </div>
        </div>
    );
}
