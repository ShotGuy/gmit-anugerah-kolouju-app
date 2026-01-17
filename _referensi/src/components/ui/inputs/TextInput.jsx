// components/ui/inputs/TextInput.jsx
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { useController, useFormContext } from "react-hook-form";

export default function TextInput({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  value,
  onChange,
  error: externalError,
  className = "",
  leftIcon,
  ...props
}) {
  const inputId = useId();
  const [showPassword, setShowPassword] = useState(false);

  // Determine actual input type (for password toggle)
  const inputType = type === "password" && showPassword ? "text" : type;

  // Try to get form context, but handle case where it doesn't exist
  const formContext = useFormContext();

  // If we have form context, use react-hook-form
  if (formContext) {
    const { control } = formContext;
    const {
      field,
      fieldState: { error },
    } = useController({ name, control });

    return (
      <div className="form-control w-full mb-4">
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            htmlFor={inputId}
          >
            {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            {...field}
            className={`w-full px-3 py-2 ${leftIcon ? "pl-10" : ""} ${type === "password" ? "pr-10" : ""} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              error ? "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500" : ""
            } ${className}`}
            placeholder={placeholder}
            {...props}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>
        )}
      </div>
    );
  }

  // Fallback to regular input when no form context
  return (
    <div className="form-control w-full mb-4">
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          htmlFor={inputId}
        >
          {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2 ${leftIcon ? "pl-10" : ""} ${type === "password" ? "pr-10" : ""} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
            externalError ? "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500" : ""
          } ${className}`}
          id={inputId}
          name={name}
          placeholder={placeholder}
          type={inputType}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {externalError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{externalError}</p>
      )}
    </div>
  );
}
