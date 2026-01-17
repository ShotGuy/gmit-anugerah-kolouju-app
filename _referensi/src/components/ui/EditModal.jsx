import { X } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import NumberInput from "@/components/ui/inputs/NumberInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextInput from "@/components/ui/inputs/TextInput";
import ToggleInput from "@/components/ui/inputs/ToggleInput";

export default function EditModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Edit Data",
  fields = [],
  initialData = {},
  isLoading = false,
}) {
  const form = useForm({
    defaultValues: initialData,
  });

  useEffect(() => {
    if (isOpen && initialData) {
      form.reset(initialData);
    }
  }, [isOpen, initialData, form]);

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
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {fields.map((field) => {
                    const fieldProps = {
                      key: field.key,
                      name: field.key,
                      label: field.label,
                      placeholder: field.placeholder,
                      required: field.required,
                      rules: getFieldRules(field),
                      disabled: isLoading,
                    };

                    if (field.type === "select") {
                      return (
                        <SelectInput {...fieldProps} options={field.options} />
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
                      <TextInput {...fieldProps} type={field.type || "text"} />
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
                  Simpan
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
