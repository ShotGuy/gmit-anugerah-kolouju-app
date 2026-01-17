import AdminLayout from "@/components/layout/AdminLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function DetailPage({
  title,
  description,
  breadcrumb = [],
  sections = [],
  actions = [],
  isLoading = false,
}) {
  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat detail..." />;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <PageHeader
          actions={actions}
          breadcrumb={breadcrumb}
          description={description}
          title={title}
        />

        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;

            return (
              <Card key={sectionIndex} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  {SectionIcon && (
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <SectionIcon className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields?.map((field, fieldIndex) => {
                    const FieldIcon = field.icon;

                    return (
                      <div key={fieldIndex} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {FieldIcon && (
                            <FieldIcon className="w-4 h-4 text-gray-400" />
                          )}
                          <label className="text-sm font-medium text-gray-700">
                            {field.label}
                          </label>
                        </div>
                        <div className="text-gray-900">
                          {field.render ? field.render(field.value) : (
                            <span className="text-sm">
                              {field.value || "-"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}