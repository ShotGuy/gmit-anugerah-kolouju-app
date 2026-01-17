import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Edit2, Key, Mail, Phone, Save, User, X } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PhoneInput from "@/components/ui/PhoneInput";
import TextInput from "@/components/ui/inputs/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/utils/showToast";

const userSchema = z
  .object({
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    noWhatsapp: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === "") return true; // Optional field
          // Check if it's a valid Indonesian phone number format
          const cleaned = val.replace(/\D/g, "");

          if (cleaned.startsWith("62")) {
            const afterCountryCode = cleaned.substring(2);

            return (
              afterCountryCode.startsWith("8") &&
              afterCountryCode.length >= 9 &&
              afterCountryCode.length <= 13
            );
          }

          return false;
        },
        {
          message:
            "Format nomor WhatsApp tidak valid. Gunakan format +6281234567890",
        }
      ),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }

      return true;
    },
    {
      message:
        "Password baru harus sama dengan konfirmasi password dan harus mengisi password lama",
      path: ["confirmPassword"],
    }
  );

export default function UserProfileSection({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { refreshUser } = useAuth();

  if (!user) return null;

  const methods = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user.username || "",
      email: user.email || "",
      noWhatsapp: user.noWhatsapp || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    formState: { errors },
  } = methods;

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        username: data.username,
        email: data.email,
      };

      // Only include noWhatsapp if it has a value (not empty string)
      if (data.noWhatsapp && data.noWhatsapp.trim() !== '') {
        payload.noWhatsapp = data.noWhatsapp;
      } else if (data.noWhatsapp === '' && user.noWhatsapp) {
        // If user is clearing the WhatsApp number, explicitly set to null
        payload.noWhatsapp = null;
      }

      // Only include password fields if changing password
      if (data.newPassword && data.currentPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const response = await axios.patch(`/api/users/${user.id}`, payload);

      return response.data;
    },
    onSuccess: async () => {
      showToast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
        color: "success",
      });
      setIsEditing(false);
      setIsChangingPassword(false);
      methods.reset({
        ...methods.getValues(),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      await refreshUser();
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal memperbarui profil",
        color: "danger",
      });
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    methods.reset({
      username: user.username || "",
      email: user.email || "",
      noWhatsapp: user.noWhatsapp || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditing(false);
    setIsChangingPassword(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profil Akun
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
            <Button size="sm" variant="outline" onClick={handleCancel}>
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
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {user.username?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">
                  {user.username}
                </div>
                <div className="text-sm text-gray-500">ID: {user.id}</div>
                <div className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wide mt-1">
                  {user.role}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="flex items-center text-gray-500 text-sm mb-1">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </span>
                <span className="block text-gray-800 font-medium">
                  {user.email}
                </span>
              </div>

              <div>
                <span className="flex items-center text-gray-500 text-sm mb-1">
                  <Phone className="h-4 w-4 mr-1" />
                  No. WhatsApp
                </span>
                <span className="block text-gray-800 font-medium">
                  {user.noWhatsapp || "-"}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Bergabung
                </span>
                <span className="block text-gray-800 font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Terakhir Update
                </span>
                <span className="block text-gray-800 font-medium">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <FormProvider {...methods}>
            <form
              className="space-y-4"
              onSubmit={methods.handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  required
                  label="Username"
                  name="username"
                  placeholder="Masukkan username"
                />

                <TextInput
                  required
                  label="Email"
                  name="email"
                  placeholder="Masukkan email"
                  type="email"
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No. WhatsApp
                  </label>
                  <PhoneInput
                    {...register("noWhatsapp")}
                    error={errors.noWhatsapp?.message}
                    placeholder="Masukkan nomor WhatsApp"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Ubah Password
                  </h4>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {isChangingPassword ? "Batal Ubah" : "Ubah Password"}
                  </Button>
                </div>

                {isChangingPassword && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                      label="Password Lama"
                      name="currentPassword"
                      placeholder="Masukkan password lama"
                      required={isChangingPassword}
                      type="password"
                    />

                    <TextInput
                      label="Password Baru"
                      name="newPassword"
                      placeholder="Masukkan password baru"
                      required={isChangingPassword}
                      type="password"
                    />

                    <TextInput
                      label="Konfirmasi Password"
                      name="confirmPassword"
                      placeholder="Konfirmasi password baru"
                      required={isChangingPassword}
                      type="password"
                    />
                  </div>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}
