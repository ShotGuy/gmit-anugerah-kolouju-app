"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Kelurahan {
    idKelurahan: string;
    nama: string;
}

interface AsyncKelurahanSelectProps {
    value?: string;
    onChange: (value: string) => void;
    initialLabel?: string; // To show label when value is set but options not loaded
}

export function AsyncKelurahanSelect({
    value,
    onChange,
    initialLabel,
}: AsyncKelurahanSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [options, setOptions] = React.useState<Kelurahan[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedLabel, setSelectedLabel] = React.useState(initialLabel || "");

    // Debounce search input
    // If useDebounce doesn't exist, I'll use simple timeout
    const [debouncedSearch, setDebouncedSearch] = React.useState("");

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    // Fetch data on open or search change
    React.useEffect(() => {
        if (!open) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/master/kelurahan?search=${debouncedSearch}`);
                if (res.ok) {
                    const data = await res.json();
                    setOptions(data);
                }
            } catch (error) {
                console.error("Failed to fetch kelurahan", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, debouncedSearch]);

    // Update label if value matches an option
    React.useEffect(() => {
        if (value) {
            const option = options.find((o) => o.idKelurahan === value);
            if (option) {
                setSelectedLabel(option.nama);
            } else if (!selectedLabel && initialLabel) {
                // Fallback to initial label if provided and not in current options
                setSelectedLabel(initialLabel);
            }
        } else {
            setSelectedLabel("");
        }
    }, [value, options, initialLabel, selectedLabel]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className={cn(!value && "text-muted-foreground")}>
                        {selectedLabel || "Pilih Kelurahan..."}
                    </span>
                    <div className="flex items-center gap-1 ml-2 shrink-0 opacity-50">
                        {value && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange("");
                                    setSelectedLabel("");
                                }}
                                className="hover:bg-muted p-0.5 rounded-sm cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </div>
                        )}
                        <ChevronsUpDown className="h-4 w-4" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                    {/* We handle filtering server-side, so disable client-side filtering or assume options match */}
                    <CommandInput
                        placeholder="Cari kelurahan..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        {loading && <div className="py-6 text-center text-sm">Loading...</div>}
                        {!loading && options.length === 0 && (
                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        )}
                        {!loading && (
                            <CommandGroup>
                                {options.map((item) => (
                                    <CommandItem
                                        key={item.idKelurahan}
                                        value={item.idKelurahan} // Use ID as value for selection, but display name? CommandItem usually filters by text content. 
                                        // Shadcn Command uses the value prop for filtering. 
                                        // We need to handle onSelect.
                                        onSelect={(currentValue) => {
                                            // currentValue from CommandItem might be normalized lower case text.
                                            // We use the item.idKelurahan directly from closure.
                                            onChange(item.idKelurahan);
                                            setSelectedLabel(item.nama);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.idKelurahan ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.nama}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
