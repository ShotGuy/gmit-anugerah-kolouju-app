// components/ui/SelectField.jsx
import { useId } from "react";
import { useController, useFormContext } from "react-hook-form";

export default function SelectField({
  name,
  label,
  options,
  placeholder,
  value,
  onChange,
  error: externalError,
  required = false,
  rules = {},
  ...props
}) {
  const inputId = useId();

  // Try to get form context, but handle case where it doesn't exist
  const formContext = useFormContext();

  // If we have form context, use react-hook-form
  if (formContext) {
    const { control } = formContext;
    const {
      field,
      fieldState: { error },
    } = useController({
      name,
      control,
      rules: rules
    });

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor={inputId}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <select
          id={inputId}
          {...field}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
          {...props}
        >
          {placeholder && (
            <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value="">
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option
              key={option.value}
              className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        )}
      </div>
    );
  }

  // Fallback to regular select when no form context
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor={inputId}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors ${
          externalError ? "border-red-500 focus:ring-red-500" : ""
        }`}
        id={inputId}
        name={name}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {placeholder && (
          <option className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value="">
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option
            key={option.value}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {externalError && (
        <p className="text-red-500 text-sm mt-1">{externalError}</p>
      )}
    </div>
  );
}