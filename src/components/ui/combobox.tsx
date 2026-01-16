"use strict";

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

export type ComboboxOption = {
    value: string;
    label: string;
};

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string | null;
    onChange: (value: string | undefined) => void;
    placeholder?: string;
    emptyText?: string;
    className?: string;
    modal?: boolean;
    disabled?: boolean;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Pilih item...",
    emptyText = "Tidak ditemukan.",
    className,
    modal = false,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);

    // Find the selected label
    const selectedLabel = React.useMemo(() => {
        if (!value) return "";
        return options.find((opt) => opt.value === value)?.label || "";
    }, [value, options]);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={modal}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedLabel || placeholder}

                    <div className="flex items-center gap-1 ml-2 shrink-0 opacity-50">
                        {value && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(undefined);
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
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Cari ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label} // Use label for visual search if needed, usually value is safer but shadcn command filters by text content (label)
                                    onSelect={(currentValue) => {
                                        // Check if shadcn command returns lowercase label or the value we want
                                        // Ideally we want the value.
                                        // But shadcn command onSelect gives the 'value' prop of CommandItem if set, else text content.
                                        // We should set value={option.label} for search matching, but handle ID selection
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
