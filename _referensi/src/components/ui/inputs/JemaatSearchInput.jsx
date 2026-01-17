import axios from "@/lib/axios";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

// Debounce helper
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export default function JemaatSearchInput({
    name,
    label,
    placeholder = "Cari nama jemaat...",
    required = false,
    error: externalError,
    onSelect, // NEW PROP
}) {
    const formContext = useFormContext();

    // States
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedJemaat, setSelectedJemaat] = useState(null);

    // Refs
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Form Control
    let field = null;
    let error = externalError;

    if (formContext) {
        const { control } = formContext;
        const controllerResult = useController({ name, control });
        field = controllerResult.field;
        error = controllerResult.fieldState.error;
    }

    // Debounced search term
    const debouncedSearch = useDebounce(inputValue, 500);

    // Fetch Logic
    useEffect(() => {
        // Only search if user is typing and not just selected an item
        if (!debouncedSearch || debouncedSearch.length < 2) {
            setOptions([]);
            return;
        }

        if (selectedJemaat && selectedJemaat.nama === debouncedSearch) {
            return;
        }

        const fetchJemaat = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("/jemaat", {
                    params: { search: debouncedSearch, limit: 10, mode: "simple" }
                });
                if (response.data.success) {
                    setOptions(response.data.data.items);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error("Failed to search jemaat", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJemaat();
    }, [debouncedSearch]);

    // Initial Value handling (e.g. edit mode)
    useEffect(() => {
        if (field?.value && !selectedJemaat) {
            // Warning: if we only have ID, we might need to fetch the single Jemaat to get the Name.
            // For 'create', it's null. For 'edit', we might need logic.
            // For now, assuming create mode mainly.
            // If needed, we can implement "fetchOne" here.
        }
    }, [field?.value]);

    // Handle Select
    const handleSelect = (jemaat) => {
        setSelectedJemaat(jemaat);
        setInputValue(jemaat.nama);
        setShowDropdown(false);
        if (field) {
            field.onChange(jemaat.id);
        }
        // Call external onSelect if provided
        if (onSelect) {
            onSelect(jemaat);
        }
    };

    const handleClear = () => {
        setInputValue("");
        setSelectedJemaat(null);
        setOptions([]);
        setShowDropdown(false);
        if (field) {
            field.onChange(null);
        }
        inputRef.current?.focus();
        if (onSelect) onSelect(null);
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="form-control w-full mb-4 relative">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    className={`
            w-full pl-10 pr-10 py-2 border rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"}
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
          `}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (!showDropdown) setShowDropdown(true);
                        // reset selected if user changes text
                        if (selectedJemaat && e.target.value !== selectedJemaat.nama) {
                            setSelectedJemaat(null);
                            field?.onChange(null);
                            if (onSelect) onSelect(null);
                        }
                    }}
                    onFocus={() => {
                        if (options.length > 0) setShowDropdown(true);
                    }}
                />

                {/* Right Actions */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    ) : inputValue ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Dropdown */}
            {showDropdown && options.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {options.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="font-medium text-gray-900 dark:text-gray-100">{option.nama}</div>
                            {option.keluarga?.rayon && (
                                <div className="text-xs text-gray-500">Rayon {option.keluarga.rayon.namaRayon}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* No Results (only show if we searched and found nothing) */}
            {showDropdown && !isLoading && debouncedSearch.length >= 2 && options.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500 text-center">
                    Tidak ada jemaat ditemukan
                </div>
            )}

            {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
        </div>
    );
}
