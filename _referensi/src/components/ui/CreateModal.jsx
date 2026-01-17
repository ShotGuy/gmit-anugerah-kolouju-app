import { X } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import NumberInput from "@/components/ui/inputs/NumberInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import ToggleInput from "@/components/ui/inputs/ToggleInput";

export default function CreateModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Tambah Data",
  description,
  submitLabel = "Simpan",
  fields = [],
  isLoading = false,
}) {
  const form = useForm();

  // Handle both array and function fields
  const getFields = () => {
    return typeof fields === "function" ? fields(form.watch()) : fields;
  };

  useEffect(() => {
    if (isOpen) {
      // Initialize form with default values
      const currentFields = getFields();
      const initialData = {};

      currentFields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialData[field.key] = field.defaultValue;
        } else if (field.value !== undefined) {
          initialData[field.key] = field.value;
        } else if (field.type === "boolean") {
          initialData[field.key] = true;
        } else if (field.type === "number") {
          initialData[field.key] = field.min || 0;
        } else {
          initialData[field.key] = "";
        }
      });
      form.reset(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const getFieldRules = (field) => {
    const rules = {};

    if (field.required) {
      rules.required = `${field.label} wajib diisi`;
    }
    if (field.min) {
      rules.min = {
        value: field.min,
        message: `${field.label} harus minimal ${field.min}`,
      };
    }
    if (field.max) {
      rules.max = {
        value: field.max,
        message: `${field.label} harus maksimal ${field.max}`,
      };
    }

    return rules;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white dark:bg-gray-800 transition-colors duration-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">{title}</h3>
            <button
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              {description && (
                <div className="p-4 pb-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              )}
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {getFields().map((field) => {
                    // Check if field has condition and should be displayed
                    const shouldDisplay =
                      !field.condition ||
                      (typeof field.condition === "function"
                        ? field.condition(form.watch())
                        : field.condition);

                    if (!shouldDisplay) return null;

                    // Handle display-only fields
                    if (field.type === "display") {
                      return (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.label}
                          </label>
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100">
                            {field.value || "-"}
                          </div>
                        </div>
                      );
                    }

                    // Handle custom component fields
                    if (field.type === "custom" && field.component) {
                      const CustomComponent = field.component;
                      return (
                        <div key={field.key}>
                          <CustomComponent
                            name={field.key}
                            label={field.label}
                            placeholder={field.placeholder}
                            required={field.required}
                            disabled={isLoading}
                            value={field.value}
                            apiEndpoint={field.apiEndpoint}
                            options={field.options}
                          />
                          {field.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                      );
                    }

                    const fieldProps = {
                      key: field.key,
                      name: field.key,
                      label: field.label,
                      placeholder: field.placeholder,
                      required: field.required,
                      rules: getFieldRules(field),
                      disabled: isLoading,
                    };

                    const fieldComponent = (() => {
                      if (field.type === "select") {
                        return (
                          <SelectInput
                            {...fieldProps}
                            options={field.options}
                          />
                        );
                      }

                      if (field.type === "number") {
                        return (
                          <NumberInput
                            {...fieldProps}
                            max={field.max}
                            min={field.min}
                            step={field.step || 1}
                          />
                        );
                      }

                      if (field.type === "boolean") {
                        return <ToggleInput {...fieldProps} />;
                      }

                      // Default to text input
                      return (
                        <TextInput
                          {...fieldProps}
                          type={field.type || "text"}
                        />
                      );
                    })();

                    return (
                      <div key={field.key}>
                        {fieldComponent}
                        {field.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 transition-colors duration-200">
                            {field.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                <Button
                  disabled={isLoading}
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Batal
                </Button>
                <Button
                  isLoading={isLoading}
                  loadingText="Menyimpan..."
                  type="submit"
                >
                  {submitLabel}
                </Button>
              </div>
            </form>
          </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
