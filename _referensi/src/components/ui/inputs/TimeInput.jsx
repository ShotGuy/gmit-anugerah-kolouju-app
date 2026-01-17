import { useId } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Clock } from "lucide-react";

export default function TimeInput({
  name,
  label,
  placeholder = "00:00",
  required,
  leftIcon,
  value,
  onChange,
  error: externalError,
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
    } = useController({ name, control });

    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor={inputId}
          >
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
            id={inputId}
            type="time"
            {...field}
            className={`w-full ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? "border-red-500 focus:ring-red-500" : ""
            }`}
            placeholder={placeholder}
            style={{
              colorScheme: "light", // Ensures consistent styling across browsers
            }}
            {...props}
          />
        </div>

        {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  }

  // Fallback to regular input when no form context
  return (
    <div className="w-full">
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          htmlFor={inputId}
        >
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
          className={`w-full ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            externalError ? "border-red-500 focus:ring-red-500" : ""
          }`}
          id={inputId}
          name={name}
          placeholder={placeholder}
          style={{
            colorScheme: "light", // Ensures consistent styling across browsers
          }}
          type="time"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        />
      </div>

      {externalError && <p className="text-sm text-red-500 mt-1">{externalError}</p>}
    </div>
  );
}
