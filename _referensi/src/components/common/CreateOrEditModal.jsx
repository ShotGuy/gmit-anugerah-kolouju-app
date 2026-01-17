import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import HookForm from "../form/HookForm";
import AutoCompleteInput from "../ui/inputs/AutoCompleteInput";
import DatePicker from "../ui/inputs/DatePicker";
import SelectInput from "../ui/inputs/SelectInput";
import TextInput from "../ui/inputs/TextInput";

import { showToast } from "@/utils/showToast";

export default function CreateOrEditModal({
  isOpen,
  onClose,
  onSuccess,
  title,
  schema,
  fields = [],
  defaultValues = {},
  editData = null,
  onSubmit,
  isLoading = false,
}) {
  const isEdit = !!editData;

  const methods = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: isEdit ? { ...defaultValues, ...editData } : defaultValues,
  });

  const { reset, setError, handleSubmit } = methods;

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      const formData = isEdit
        ? { ...defaultValues, ...editData }
        : defaultValues;

      reset(formData);
    }
  }, [isOpen, editData, defaultValues, reset, isEdit]);

  const handleFormSubmit = async (data) => {
    try {
      const result = await onSubmit(data, isEdit);

      if (result.success) {
        showToast({
          title: "Berhasil",
          description:
            result.message ||
            `Data berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`,
          color: "success",
        });

        onSuccess?.();
        onClose();
      } else {
        // Handle validation errors
        if (result.errors && typeof result.errors === "object") {
          Object.keys(result.errors).forEach((key) => {
            setError(key, {
              type: "manual",
              message: result.errors[key],
            });
          });
        }

        showToast({
          title: `Gagal ${isEdit ? "memperbarui" : "menambahkan"}`,
          description:
            result.message ||
            `Gagal ${isEdit ? "memperbarui" : "menambahkan"} data`,
          color: "error",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast({
        title: "Error",
        description: "Terjadi kesalahan sistem",
        color: "error",
      });
    }
  };

  const renderField = (field) => {
    const {
      type,
      name,
      label,
      placeholder,
      options,
      apiEndpoint,
      required,
      ...fieldProps
    } = field;

    switch (type) {
      case "text":
      case "email":
      case "number":
        return (
          <TextInput
            key={name}
            label={label}
            name={name}
            placeholder={placeholder}
            required={required}
            type={type}
            {...fieldProps}
          />
        );

      case "date":
      case "datepicker":
        return (
          <DatePicker
            key={name}
            label={label}
            name={name}
            placeholder={placeholder}
            required={required}
            {...fieldProps}
          />
        );

      case "textarea":
        return (
          <TextInput
            key={name}
            label={label}
            name={name}
            placeholder={placeholder}
            type="textarea"
            {...fieldProps}
          />
        );

      case "select":
        // If apiEndpoint is provided, use autocomplete instead
        if (apiEndpoint) {
          return (
            <AutoCompleteInput
              key={name}
              apiEndpoint={apiEndpoint}
              label={label}
              name={name}
              placeholder={placeholder}
              required={required}
              {...fieldProps}
            />
          );
        }

        return (
          <SelectInput
            key={name}
            label={label}
            name={name}
            options={options || []}
            placeholder={placeholder}
            {...fieldProps}
          />
        );

      case "autocomplete":
        return (
          <AutoCompleteInput
            key={name}
            apiEndpoint={apiEndpoint}
            label={label}
            name={name}
            options={options}
            placeholder={placeholder}
            required={required}
            {...fieldProps}
          />
        );

      default:
        return (
          <TextInput
            key={name}
            label={label}
            name={name}
            placeholder={placeholder}
            {...fieldProps}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit ? `Edit ${title}` : `Tambah ${title}`}
            </h3>
            <button
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <HookForm methods={methods} onSubmit={handleFormSubmit}>
              <div className="space-y-4">{fields.map(renderField)}</div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  disabled={isLoading}
                  type="button"
                  onClick={onClose}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isEdit ? "Memperbarui..." : "Menyimpan..."}
                    </div>
                  ) : isEdit ? (
                    "Perbarui"
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </HookForm>
          </div>
        </div>
      </div>
    </div>
  );
}
