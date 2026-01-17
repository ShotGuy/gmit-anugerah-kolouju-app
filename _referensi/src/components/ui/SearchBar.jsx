"use client";

import { useEffect, useState } from "react";
import { Search, X, Filter } from "lucide-react";

export default function SearchBar({
  value,
  onSearch,
  onChange,
  onClear,
  onFilterChange,
  filters = [],
  selectedFilter,
  placeholder = "Cari...",
  isLoading = false,
  className = "",
  debounceMs = 300,
}) {
  const [internalValue, setInternalValue] = useState("");
  const searchValue = value ?? internalValue;

  const handleChange = (val) => {
    if (value === undefined) setInternalValue(val);
    onChange?.(val);
  };

  const handleSearch = () => onSearch?.(searchValue);
  const handleClear = () => {
    if (value === undefined) setInternalValue("");
    onClear?.();
    onChange?.("");
  };

  // Debounced automatic search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchValue.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearch]);

  return (
    <div className={`flex items-center gap-2 w-full ${className}`}>
      {filters.length > 0 && (
        <div className="dropdown">
          <label className="btn btn-outline btn-square" tabIndex={0}>
            <Filter className="w-5 h-5" />
          </label>
          <ul
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            tabIndex={0}
          >
            {filters.map((f) => (
              <li key={f.key}>
                <a
                  className={selectedFilter === f.key ? "active" : ""}
                  onClick={() => onFilterChange?.(f.key)}
                >
                  {f.icon && <span>{f.icon}</span>}
                  {f.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 relative">
        <input
          className="input input-bordered w-full pl-10 pr-10"
          placeholder={placeholder}
          type="text"
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") handleClear();
          }}
        />
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

        {searchValue && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      <button
        className={`btn btn-primary ${isLoading ? "loading" : ""}`}
        onClick={handleSearch}
      >
        {!isLoading && <Search className="w-5 h-5" />}
        {!isLoading && "Cari"}
      </button>
    </div>
  );
}
