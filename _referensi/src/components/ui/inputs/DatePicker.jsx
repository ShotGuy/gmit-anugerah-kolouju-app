import { forwardRef } from "react";
import { useController, useFormContext } from "react-hook-form";

import { formatUtils } from "@/lib/formatUtils";

const DatePicker = forwardRef(function DatePicker(
  {
    name,
    placeholder = "Pilih tanggal",
    className = "",
    label,
    required,
    leftIcon,
    value,
    onChange,
    error: externalError,
    ...props
  },
  ref
) {
  // Try to get form context, but handle case where it doesn't exist
  const formContext = useFormContext();

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return "";

    try {
      const date = new Date(dateValue);

      return formatUtils.formatDate(date, "DD/MM/YYYY");
    } catch (error) {
      return dateValue;
    }
  };

  // If we have form context, use react-hook-form
  if (formContext) {
    const { control } = formContext;
    const {
      field,
      fieldState: { error },
    } = useController({ name, control });

    const handleChange = (e) => {
      field.onChange(e.target.value);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type="date"
            {...field}
            className={`w-full ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors ${
              error ? "border-red-500 focus:ring-red-500" : ""
            } ${className}`}
            placeholder={placeholder}
            onChange={handleChange}
            {...props}
            style={{
              colorScheme: "auto", // Adapts to system theme
            }}
          />

          {field.value && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
              {formatDisplayDate(field.value)}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  }

  // Fallback to regular input when no form context
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors ${
            externalError ? "border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          name={name}
          placeholder={placeholder}
          type="date"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
          style={{
            colorScheme: "auto", // Adapts to system theme
          }}
        />

        {value && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            {formatDisplayDate(value)}
          </div>
        )}
      </div>

      {externalError && (
        <p className="text-sm text-red-500 mt-1">{externalError}</p>
      )}
    </div>
  );
});

export default DatePicker;
