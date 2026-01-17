// components/ui/inputs/AutoCompleteInput.jsx
import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

import axios from "@/lib/axios";

export default function AutoCompleteInput({
  name,
  label,
  options,
  placeholder,
  apiEndpoint,
  required = false,
  value,
  onChange,
  error: externalError,
}) {
  const inputId = useId();

  // Try to get form context, but handle case where it doesn't exist
  const formContext = useFormContext();

  const [apiOptions, setApiOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Only use useController if form context exists
  let field = null;
  let error = externalError;

  if (formContext) {
    const { control } = formContext;
    const controllerResult = useController({ name, control });

    field = controllerResult.field;
    error = controllerResult.fieldState.error;
  }

  // Fetch options from API if apiEndpoint is provided
  useEffect(() => {
    if (apiEndpoint) {
      setIsLoading(true);
      axios
        .get(apiEndpoint)
        .then((response) => {
          const data = response.data;

          if (data.success && Array.isArray(data.data)) {
            setApiOptions(data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching options:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [apiEndpoint]);

  // Use API options if available, otherwise use provided options
  // Ensure finalOptions is always an array
  const finalOptions = (() => {
    const opts = apiEndpoint ? apiOptions : options;

    // Handle various data structures
    if (!opts) return [];
    if (Array.isArray(opts)) return opts;

    // If opts is an object with 'items' property (from API response)
    if (opts.items && Array.isArray(opts.items)) return opts.items;

    // If opts is an object with 'data' property
    if (opts.data && Array.isArray(opts.data)) return opts.data;

    // Otherwise return empty array
    return [];
  })();

  // Update input value when field value changes
  useEffect(() => {
    const currentValue = field ? field.value : value;

    if (currentValue && Array.isArray(finalOptions)) {
      const selectedOption = finalOptions.find(
        (option) => option && option.value === currentValue
      );

      setInputValue(
        selectedOption
          ? selectedOption.label || selectedOption.value
          : currentValue
      );
    } else {
      setInputValue("");
    }
  }, [field?.value, value, finalOptions]);

  // Filter options based on input
  useEffect(() => {
    if (
      inputValue &&
      Array.isArray(finalOptions) &&
      finalOptions.length > 0
    ) {
      const filtered = finalOptions.filter((option) => {
        if (!option) return false;
        const displayText = (option.label || option.value || "").toString();
        return displayText.toLowerCase().includes(inputValue.toLowerCase());
      });

      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(Array.isArray(finalOptions) ? finalOptions : []);
    }
  }, [inputValue, finalOptions]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;

    setInputValue(newValue);
    setShowDropdown(true);

    // If input matches an option exactly, set the field value
    const exactMatch = Array.isArray(finalOptions)
      ? finalOptions.find((option) => {
          const optionText = (option?.label || option?.value || "").toString();
          return optionText.toLowerCase() === newValue.toLowerCase();
        })
      : null;

    const valueToSet = exactMatch ? exactMatch.value : newValue;

    if (field) {
      field.onChange(valueToSet);
    } else if (onChange) {
      onChange(valueToSet);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setInputValue(option.label || option.value);

    if (field) {
      field.onChange(option.value);
    } else if (onChange) {
      onChange(option.value);
    }

    setShowDropdown(false);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = () => {
    setShowDropdown(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Clear input
  const handleClear = () => {
    setInputValue("");

    if (field) {
      field.onChange("");
    } else if (onChange) {
      onChange("");
    }

    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className="form-control w-full mb-4">
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          htmlFor={inputId}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          autoComplete="off"
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 dark:border-gray-600"}
            ${isLoading ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}
            text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
          `}
          disabled={isLoading}
          id={inputId}
          placeholder={placeholder}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />

        {/* Clear button */}
        {inputValue && !isLoading && (
          <button
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            type="button"
            onClick={handleClear}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown arrow */}
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          disabled={isLoading}
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {showDropdown &&
          !isLoading &&
          Array.isArray(filteredOptions) &&
          filteredOptions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {filteredOptions.map((option, index) => {
                if (!option) return null;
                return (
                  <div
                    key={option.value || index}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 text-sm text-gray-900 dark:text-gray-100 transition-colors"
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.label || option.value}
                  </div>
                );
              })}
            </div>
          )}

        {/* No results message */}
        {showDropdown &&
          !isLoading &&
          inputValue &&
          Array.isArray(filteredOptions) &&
          filteredOptions.length === 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
            >
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Tidak ada hasil ditemukan
              </div>
            </div>
          )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}

      {isLoading && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Memuat data...</p>
      )}
    </div>
  );
}
