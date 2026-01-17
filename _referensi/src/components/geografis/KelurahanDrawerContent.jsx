import { useRouter } from "next/navigation";
import React from "react";

import LoadingScreen from "@/components/ui/LoadingScreen";
import useModalForm from "@/hooks/useModalForm";

export default function KelurahanDrawerContent({
  data,
  isLoading,
  kecamatanName,
}) {
  const modal = useModalForm();
  const router = useRouter();

  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat data kelurahan..." />;
  }

  if (!data?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📍</div>
        <p className="text-sm text-gray-500 mb-2">Belum ada kelurahan</p>
        <p className="text-xs text-gray-400">untuk provinsi {kecamatanName}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        Ditemukan {data.length} kelurahan
      </div>
      <div>KelurahanDrawerContent</div>
    </div>
  );
}
