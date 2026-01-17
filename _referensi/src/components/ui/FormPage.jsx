import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import TextInput from "@/components/ui/inputs/TextInput";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import NumberInput from "@/components/ui/inputs/NumberInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimeInput from "@/components/ui/inputs/TimeInput";
import ToggleInput from "@/components/ui/inputs/ToggleInput";
import FileUpload from "@/components/ui/inputs/FileUpload";

export default function FormPage({
  title,
  description,
  breadcrumb = [],
  fields = [],
  formData = {},
  onInputChange,
  onSubmit,
  actions = [],
  isLoading = false,
}) {
  const renderField = (field) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      placeholder: field.placeholder,
      value: formData[field.name] || "",
      onChange: (e) => {
        if (onInputChange) {
          onInputChange({
            target: {
              name: field.name,
              value: typeof e === "object" && e.target ? e.target.value : e,
            },
          });
        }
      },
      required: field.required,
      disabled: isLoading,
    };

    switch (field.type) {
      case "select":
        return <SelectInput {...commonProps} options={field.options || []} />;
      case "textarea":
        return <TextAreaInput {...commonProps} rows={field.rows || 4} />;
      case "number":
        return (
          <NumberInput
            {...commonProps}
            max={field.max}
            min={field.min}
            step={field.step}
          />
        );
      case "date":
        return <DatePicker {...commonProps} />;
      case "time":
        return <TimeInput {...commonProps} />;
      case "toggle":
        return (
          <ToggleInput
            {...commonProps}
            checked={formData[field.name] || false}
          />
        );
      case "file":
        return (
          <FileUpload
            {...commonProps}
            accept={field.accept}
            multiple={field.multiple}
          />
        );
      default:
        return <TextInput {...commonProps} type={field.type || "text"} />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          breadcrumb={breadcrumb}
          description={description}
          title={title}
        />

        <Card className="p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field, index) => (
                <div
                  key={field.name || index}
                  className={field.fullWidth ? "md:col-span-2" : ""}
                >
                  <div className="space-y-2">
                    {field.icon && (
                      <div className="flex items-center gap-2 mb-1">
                        <field.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {field.label}
                        </span>
                      </div>
                    )}
                    {renderField(field)}
                    {field.description && (
                      <p className="text-xs text-gray-500">
                        {field.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              {actions.map((action, index) => {
                const ActionIcon = action.icon;

                return (
                  <Button
                    key={index}
                    className="flex items-center gap-2"
                    disabled={action.loading || isLoading}
                    size={action.size || "md"}
                    type={action.type || "button"}
                    variant={action.variant || "primary"}
                    onClick={action.onClick}
                  >
                    {ActionIcon && <ActionIcon className="w-4 h-4" />}
                    {action.loading ? "Memproses..." : action.label}
                  </Button>
                );
              })}
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
