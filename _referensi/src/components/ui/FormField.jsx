// components/ui/FormField.jsx
import { Children, cloneElement, useId } from "react";
import { useController, useFormContext } from "react-hook-form";

export default function FormField({
  name,
  label,
  required = false,
  error: externalError,
  isLoading = false,
  children, // Accept children
  ...props
}) {
  const inputId = useId();

  // Try to get form context, but handle case where it doesn't exist
  const formContext = useFormContext();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="form-control w-full mb-4">
        {label && (
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
        )}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  // If we have form context, use react-hook-form
  if (formContext) {
    const { control } = formContext;
    const {
      field,
      fieldState: { error },
    } = useController({ name, control });

    // Clone the child element and spread field props
    const childElement = Children.only(children);

    return (
      <div className="form-control w-full mb-4">
        {label && (
          <label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            htmlFor={inputId}
          >
            {label}{" "}
            {required && (
              <span className="text-red-500 dark:text-red-400">*</span>
            )}
          </label>
        )}
        {cloneElement(childElement, {
          ...field,
          ...childElement.props,
          id: inputId,
          ...props,
          className: `${childElement.props.className || ""} ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`.trim(),
        })}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  // Fallback to regular input when no form context
  const childElement = Children.only(children);

  return (
    <div className="form-control w-full mb-4">
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          htmlFor={inputId}
        >
          {label}{" "}
          {required && (
            <span className="text-red-500 dark:text-red-400">*</span>
          )}
        </label>
      )}
      {cloneElement(childElement, {
        ...childElement.props,
        id: inputId,
        name: name,
        ...props,
        className: `${childElement.props.className || ""} ${
          externalError ? "border-red-500 focus:ring-red-500" : ""
        }`.trim(),
      })}
      {externalError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {externalError}
        </p>
      )}
    </div>
  );
}
