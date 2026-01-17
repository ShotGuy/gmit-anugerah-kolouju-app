import { useState } from "react";
import { Edit2, Save, X, Briefcase, Calendar } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import TextInput from "@/components/ui/inputs/TextInput";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TextAreaInput from "@/components/ui/inputs/TextAreaInput";
import { showToast } from "@/utils/showToast";
import { useAuth } from "@/contexts/AuthContext";

const employeeSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap harus diisi"),
  posisi: z.string().optional(),
  tanggalMasuk: z.string()
    .optional()
    .transform((str) => str ? new Date(str) : null),
  deskripsiTugas: z.string().optional(),
  departemen: z.string().optional()
});

export default function EmployeeProfileSection({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const { refreshUser } = useAuth();

  // For EMPLOYEE role, we'll use basic user data since there's no specific Employee model
  // You might need to extend this based on your actual employee data structure
  const employeeData = {
    namaLengkap: user.username || "",
    posisi: "Employee", // Default value
    tanggalMasuk: user.createdAt ? new Date(user.createdAt) : null,
    deskripsiTugas: "",
    departemen: ""
  };

  const methods = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      namaLengkap: employeeData.namaLengkap,
      posisi: employeeData.posisi || "",
      tanggalMasuk: employeeData.tanggalMasuk ? 
        new Date(employeeData.tanggalMasuk).toISOString().split('T')[0] : "",
      deskripsiTugas: employeeData.deskripsiTugas || "",
      departemen: employeeData.departemen || ""
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Since there's no specific employee table, this would update user profile
      const response = await axios.patch(`/api/users/${user.id}`, {
        username: data.namaLengkap,
        // Add other employee-specific fields if you extend the User model
      });
      return response.data;
    },
    onSuccess: async () => {
      showToast({
        title: "Berhasil",
        description: "Profil karyawan berhasil diperbarui",
        color: "success"
      });
      setIsEditing(false);
      await refreshUser();
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal memperbarui profil",
        color: "danger"
      });
    }
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    methods.reset();
    setIsEditing(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Profil Karyawan
        </CardTitle>
        {!isEditing ? (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button 
              disabled={updateMutation.isLoading}
              size="sm"
              onClick={methods.handleSubmit(onSubmit)}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-gray-500 text-sm">Nama Lengkap</span>
              <span className="block text-gray-800 font-medium">{employeeData.namaLengkap}</span>
            </div>
            
            <div>
              <span className="block text-gray-500 text-sm">Posisi</span>
              <span className="block text-gray-800 font-medium">{employeeData.posisi}</span>
            </div>
            
            <div>
              <span className="block text-gray-500 text-sm">Tanggal Bergabung</span>
              <span className="block text-gray-800 font-medium">
                {employeeData.tanggalMasuk ? 
                  new Date(employeeData.tanggalMasuk).toLocaleDateString('id-ID') : "-"}
              </span>
            </div>
            
            <div>
              <span className="block text-gray-500 text-sm">Departemen</span>
              <span className="block text-gray-800 font-medium">
                {employeeData.departemen || "-"}
              </span>
            </div>
            
            <div className="md:col-span-2">
              <span className="block text-gray-500 text-sm">Deskripsi Tugas</span>
              <span className="block text-gray-800 font-medium">
                {employeeData.deskripsiTugas || "-"}
              </span>
            </div>
            
            <div className="md:col-span-2">
              <span className="block text-gray-500 text-sm">Status</span>
              <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide">
                Aktif
              </span>
            </div>
          </div>
        ) : (
          <FormProvider {...methods}>
            <form className="space-y-4" onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  required
                  label="Nama Lengkap"
                  name="namaLengkap"
                  placeholder="Masukkan nama lengkap"
                />
                
                <TextInput
                  label="Posisi"
                  name="posisi"
                  placeholder="Masukkan posisi"
                />
                
                <DatePicker
                  label="Tanggal Bergabung"
                  name="tanggalMasuk"
                  placeholder="Pilih tanggal bergabung"
                />
                
                <TextInput
                  label="Departemen"
                  name="departemen"
                  placeholder="Masukkan departemen"
                />
                
                <div className="md:col-span-2">
                  <TextAreaInput
                    label="Deskripsi Tugas"
                    name="deskripsiTugas"
                    placeholder="Masukkan deskripsi tugas"
                    rows={3}
                  />
                </div>
              </div>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}