import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  FileText,
  Image as ImageIcon,
  Pin,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Stepper, { StepperNavigation } from "@/components/ui/Stepper";
import DatePicker from "@/components/ui/inputs/DatePicker";
import SelectInput from "@/components/ui/inputs/SelectInput";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import TextInput from "@/components/ui/inputs/TextInput";
import pengumumanService from "@/services/pengumumanService";
import { showToast } from "@/utils/showToast";

const steps = [
  {
    id: 1,
    title: "Informasi Dasar",
    description: "Judul, kategori, dan jenis pengumuman",
  },
  {
    id: 2,
    title: "Konten Pengumuman",
    description: "Konten dinamis sesuai kategori",
  },
  {
    id: 3,
    title: "Lampiran & Pengaturan",
    description: "Upload file dan pengaturan publikasi",
  },
];

const DynamicContentForm = ({ form, kategoriId, jenisId }) => {
  const [contentFields, setContentFields] = useState([]);

  useEffect(() => {
    // Reset content fields when kategori/jenis changes
    if (kategoriId) {
      generateContentFields(kategoriId, jenisId);
    }
  }, [kategoriId, jenisId]);

  const generateContentFields = (kategoriId, jenisId) => {
    // Default fields untuk semua kategori
    let fields = [
      {
        name: "deskripsi",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Masukkan deskripsi pengumuman...",
        required: true,
        rows: 4,
      },
    ];

    // Tambah fields spesifik berdasarkan kategori
    // Ini bisa dikustomisasi sesuai kebutuhan masing-masing kategori
    switch (kategoriId) {
      case "kategori_kegiatan":
        fields.push(
          {
            name: "tanggalKegiatan",
            label: "Tanggal Kegiatan",
            type: "date",
            required: true,
          },
          {
            name: "waktuKegiatan",
            label: "Waktu Kegiatan",
            type: "time",
            required: false,
          },
          {
            name: "lokasiKegiatan",
            label: "Lokasi Kegiatan",
            type: "text",
            placeholder: "Masukkan lokasi kegiatan...",
            required: false,
          },
          {
            name: "kontakPerson",
            label: "Contact Person",
            type: "text",
            placeholder: "Nama dan nomor telepon...",
            required: false,
          }
        );
        break;

      case "kategori_ibadah":
        fields.push(
          {
            name: "tanggalIbadah",
            label: "Tanggal Ibadah",
            type: "date",
            required: true,
          },
          {
            name: "waktuIbadah",
            label: "Waktu Ibadah",
            type: "time",
            required: true,
          },
          {
            name: "tempatIbadah",
            label: "Tempat Ibadah",
            type: "text",
            placeholder: "Masukkan tempat ibadah...",
            required: true,
          },
          {
            name: "pemimpin",
            label: "Pemimpin Ibadah",
            type: "text",
            placeholder: "Nama pemimpin ibadah...",
            required: false,
          },
          {
            name: "tema",
            label: "Tema",
            type: "text",
            placeholder: "Tema ibadah...",
            required: false,
          },
          {
            name: "ayatFirman",
            label: "Ayat Firman",
            type: "text",
            placeholder: "Referensi ayat alkitab...",
            required: false,
          }
        );
        break;

      case "kategori_informasi":
        fields.push(
          {
            name: "informasiTambahan",
            label: "Informasi Tambahan",
            type: "textarea",
            placeholder: "Informasi detail lainnya...",
            required: false,
            rows: 3,
          },
          {
            name: "batasWaktu",
            label: "Batas Waktu",
            type: "date",
            required: false,
          }
        );
        break;

      case "kategori_undangan":
        fields.push(
          {
            name: "tanggalAcara",
            label: "Tanggal Acara",
            type: "date",
            required: true,
          },
          {
            name: "waktuAcara",
            label: "Waktu Acara",
            type: "time",
            required: true,
          },
          {
            name: "lokasiAcara",
            label: "Lokasi Acara",
            type: "text",
            placeholder: "Alamat lengkap acara...",
            required: true,
          },
          {
            name: "dresscode",
            label: "Dress Code",
            type: "text",
            placeholder: "Ketentuan pakaian...",
            required: false,
          },
          {
            name: "rsvp",
            label: "RSVP",
            type: "text",
            placeholder: "Konfirmasi kehadiran ke...",
            required: false,
          }
        );
        break;

      default:
        // Fields default
        fields.push({
          name: "informasiLainnya",
          label: "Informasi Lainnya",
          type: "textarea",
          placeholder: "Informasi tambahan...",
          required: false,
          rows: 3,
        });
    }

    setContentFields(fields);
  };

  const renderField = (field) => {
    const commonProps = {
      key: field.name,
      name: `konten.${field.name}`,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      validation: field.required
        ? { required: `${field.label} wajib diisi` }
        : {},
    };

    switch (field.type) {
      case "textarea":
        return <TextAreaInput {...commonProps} rows={field.rows || 3} />;
      case "date":
        return <DatePicker {...commonProps} />;
      case "time":
        return <TextInput {...commonProps} type="time" />;
      default:
        return <TextInput {...commonProps} type={field.type || "text"} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Konten Pengumuman
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Form akan menyesuaikan dengan kategori yang dipilih
        </p>
      </div>

      {contentFields.map(renderField)}
    </div>
  );
};

const FileUploadSection = ({ form, attachments, setAttachments }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    setUploading(true);

    try {
      const processedFiles = await pengumumanService.processFiles(files);

      if (processedFiles) {
        setAttachments((prev) => [...prev, ...processedFiles]);
      }
    } catch (error) {
      showToast({
        title: "Gagal",
        description: error.message || "Gagal mengupload file",
        color: "danger",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  const removeFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Lampiran File
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Upload gambar (maksimal 1MB) atau PDF (maksimal 3MB)
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <div className="mt-4">
            <div className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
              Pilih file untuk diupload
            </div>
            <div className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, JPEG, PDF
            </div>
            <input
              multiple
              accept="image/*,.pdf"
              className="sr-only"
              disabled={uploading}
              id="file-upload"
              name="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <Button
              className="mt-4"
              disabled={uploading}
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload').click()}
            >
              {uploading ? "Mengupload..." : "Pilih File"}
            </Button>
          </div>
        </div>
      </div>

      {/* File Size Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 transition-colors">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-blue-400 dark:text-blue-300" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Batasan Ukuran File
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Gambar: maksimal 1MB per file</li>
                <li>PDF: maksimal 3MB per file</li>
                <li>Total file yang bisa diupload tidak terbatas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            File yang diupload ({attachments.length})
          </h4>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  {file.fileType?.startsWith("image/") ? (
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500" />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.fileName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.fileSize)} • {file.fileType}
                    </p>
                  </div>
                </div>
                <button
                  className="ml-4 text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-400 transition-colors"
                  type="button"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreatePengumuman() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [attachments, setAttachments] = useState([]);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      judul: "",
      kategoriId: "",
      jenisId: "",
      tanggalPengumuman: "",
      status: "DRAFT",
      prioritas: "MEDIUM",
      isPinned: false,
      konten: {},
    },
  });

  const watchKategori = form.watch("kategoriId");
  const watchJenis = form.watch("jenisId");

  // Fetch options
  const { data: optionsData, isLoading: isOptionsLoading } = useQuery({
    queryKey: ["pengumuman-options"],
    queryFn: () => pengumumanService.getOptions(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: pengumumanService.create,
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Pengumuman berhasil dibuat",
        color: "success",
      });
      router.push("/employee/pengumuman");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal membuat pengumuman",
        color: "danger",
      });
    },
  });

  // Step validation logic
  const validateCurrentStep = async () => {
    const values = form.getValues();

    switch (currentStep) {
      case 1:
        const step1Required = ["judul", "kategoriId", "tanggalPengumuman"];
        const step1Valid = step1Required.every(
          (field) => values[field] && values[field].toString().trim() !== ""
        );

        if (!step1Valid) {
          showToast({
            title: "Validasi Gagal",
            description: "Harap lengkapi semua field yang wajib diisi",
            color: "danger",
          });

          return false;
        }
        break;

      case 2:
        if (!values.konten || Object.keys(values.konten).length === 0) {
          showToast({
            title: "Validasi Gagal",
            description: "Harap isi konten pengumuman",
            color: "danger",
          });

          return false;
        }

        // Check required fields in konten
        const kontenValues = values.konten;

        if (!kontenValues.deskripsi || kontenValues.deskripsi.trim() === "") {
          showToast({
            title: "Validasi Gagal",
            description: "Deskripsi pengumuman wajib diisi",
            color: "danger",
          });

          return false;
        }
        break;

      case 3:
        // No specific validation for step 3, attachments are optional
        break;
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        attachments: attachments.length > 0 ? attachments : null,
        createdBy: "current-user-id", // TODO: get from auth context
      };

      await createMutation.mutateAsync(submitData);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleFinish = async () => {
    const isValid = await validateCurrentStep();

    if (isValid) {
      const values = form.getValues();

      await handleSubmit(values);
    }
  };

  const kategoriOptions = optionsData?.data?.kategori || [];
  const jenisOptions =
    optionsData?.data?.jenis?.filter(
      (jenis) => !watchKategori || jenis.kategoriId === watchKategori
    ) || [];
  const statusOptions = optionsData?.data?.enums?.status || [];
  const prioritasOptions = optionsData?.data?.enums?.prioritas || [];

  return (
    <div className="space-y-6 p-4 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <PageHeader
        breadcrumb={[
          { label: "Employee", href: "/employee/dashboard" },
          { label: "Pengumuman", href: "/employee/pengumuman" },
          { label: "Buat Baru" },
        ]}
        description="Buat pengumuman untuk jemaat dan majelis gereja"
        title="Buat Pengumuman Baru"
      />

      <Card className="p-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Stepper Header */}
            <Stepper currentStep={currentStep} steps={steps} />

            {/* Step Content */}
            <div className="mt-8">
              {/* Step 1: Informasi Dasar */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg transition-colors">
                      <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Informasi Dasar
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Masukkan informasi dasar pengumuman
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <TextInput
                        required
                        label="Judul Pengumuman"
                        name="judul"
                        placeholder="Masukkan judul pengumuman..."
                        validation={{
                          required: "Judul pengumuman wajib diisi",
                          maxLength: {
                            value: 255,
                            message: "Judul maksimal 255 karakter",
                          },
                        }}
                      />
                    </div>

                    <SelectInput
                      required
                      label="Kategori Pengumuman"
                      name="kategoriId"
                      options={kategoriOptions.map((k) => ({
                        value: k.id,
                        label: k.nama,
                      }))}
                      placeholder="Pilih kategori..."
                      validation={{
                        required: "Kategori pengumuman wajib dipilih",
                      }}
                    />

                    {watchKategori && jenisOptions.length > 0 && (
                      <SelectInput
                        label="Jenis Pengumuman"
                        name="jenisId"
                        options={jenisOptions.map((j) => ({
                          value: j.id,
                          label: j.nama,
                        }))}
                        placeholder="Pilih jenis pengumuman..."
                      />
                    )}

                    <DatePicker
                      required
                      label="Tanggal Pengumuman"
                      name="tanggalPengumuman"
                      validation={{
                        required: "Tanggal pengumuman wajib diisi",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Konten Pengumuman */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg transition-colors">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Konten Pengumuman
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Isi konten sesuai dengan kategori yang dipilih
                      </p>
                    </div>
                  </div>

                  {watchKategori ? (
                    <DynamicContentForm
                      form={form}
                      jenisId={watchJenis}
                      kategoriId={watchKategori}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p>
                        Pilih kategori pada langkah sebelumnya untuk melanjutkan
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Lampiran & Pengaturan */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg transition-colors">
                      <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Lampiran & Pengaturan
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload file dan atur pengaturan publikasi
                      </p>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <FileUploadSection
                    attachments={attachments}
                    form={form}
                    setAttachments={setAttachments}
                  />

                  {/* Publishing Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Pengaturan Publikasi
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <SelectInput
                        label="Status"
                        name="status"
                        options={statusOptions.map((s) => ({
                          value: s.value,
                          label: s.label,
                        }))}
                      />

                      <SelectInput
                        label="Prioritas"
                        name="prioritas"
                        options={prioritasOptions.map((p) => ({
                          value: p.value,
                          label: p.label,
                        }))}
                      />

                      <div className="flex items-center space-x-3">
                        <input
                          id="isPinned"
                          type="checkbox"
                          {...form.register("isPinned")}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2"
                          htmlFor="isPinned"
                        >
                          <Pin className="h-4 w-4" />
                          Pin Pengumuman
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <StepperNavigation
              currentStep={currentStep}
              isLoading={createMutation.isPending}
              totalSteps={steps.length}
              onNext={handleNext}
              onPrevious={handlePrev}
              onSubmit={handleFinish}
            />
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
