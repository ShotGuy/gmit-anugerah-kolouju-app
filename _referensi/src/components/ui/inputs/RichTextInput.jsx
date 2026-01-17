import { useId, useMemo } from "react";
import { useController, useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Import Quill dynamically untuk menghindari SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function RichTextInput({
  name,
  label,
  placeholder,
  required = false,
  value,
  onChange,
  error: externalError,
  className = "",
  minHeight = "300px",
  description,
  ...props
}) {
  const inputId = useId();

  // Quill modules configuration
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
  ];

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
      <div className={`form-control w-full mb-4 ${className}`}>
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
        <div
          className={`border-2 rounded-lg overflow-hidden ${
            error
              ? "border-red-300 dark:border-red-600"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <ReactQuill
            theme="snow"
            value={field.value || ""}
            onChange={field.onChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder={placeholder}
            style={{ minHeight }}
            {...props}
          />
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  // Fallback to regular input when no form context
  return (
    <div className={`form-control w-full mb-4 ${className}`}>
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          htmlFor={inputId}
        >
          {label}{" "}
          {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </label>
      )}
      <div
        className={`border-2 rounded-lg overflow-hidden ${
          externalError
            ? "border-red-300 dark:border-red-600"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <ReactQuill
          theme="snow"
          value={value || ""}
          onChange={(val) => onChange?.(val)}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder}
          style={{ minHeight }}
          {...props}
        />
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {externalError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {externalError}
        </p>
      )}
    </div>
  );
}
