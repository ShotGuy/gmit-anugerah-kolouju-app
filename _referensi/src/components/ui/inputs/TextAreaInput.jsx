// components/ui/inputs/TextAreaInput.jsx
import { useId } from "react";
import { useController, useFormContext } from "react-hook-form";

export default function TextAreaInput({
  name,
  label,
  placeholder,
  rows = 4,
  className = "",
  value,
  onChange,
  error: externalError,
  ...props
}) {
  const textareaId = useId();
  
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
      <div className={`${className}`}>
        <label
          className="block text-sm font-medium text-gray-700 mb-2"
          htmlFor={textareaId}
        >
          {label}
        </label>
        <textarea
          id={textareaId}
          {...field}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={placeholder}
          rows={rows}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
      </div>
    );
  }

  // Fallback to regular textarea when no form context
  return (
    <div className={`${className}`}>
      <label
        className="block text-sm font-medium text-gray-700 mb-2"
        htmlFor={textareaId}
      >
        {label}
      </label>
      <textarea
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        id={textareaId}
        name={name}
        placeholder={placeholder}
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {externalError && <p className="text-red-500 text-sm mt-2">{externalError}</p>}
    </div>
  );
}
