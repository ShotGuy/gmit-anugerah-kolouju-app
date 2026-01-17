import React from "react";
import { useRouter } from "next/navigation";

import LoadingScreen from "@/components/ui/LoadingScreen";
import CreateOrEditModal from "../common/CreateOrEditModal";
import useModalForm from "@/hooks/useModalForm";
const KotaKabupatenDrawerContent = ({ data, isLoading, provinsiName }) => {
  const modal = useModalForm();
  const router = useRouter();

  const kecamatanFields = [
    {
      type: "text",
      name: "nama",
      label: "Nama Kecamatan",
      placeholder: "Masukkan nama kecamatan",
      required: true,
    },
  ];
  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Memuat data kota/kabupaten..." />;
  }

  if (!data?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📍</div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Belum ada kota/kabupaten</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">untuk provinsi {provinsiName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Ditemukan {data.length} kota/kabupaten
      </div>
      {data.map((kab, index) => (
        <div
          key={kab.id}
          className="border border-gray-200 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                {kab.nama}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">ID: {kab.id}</div>
              {kab.isActive !== undefined && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      kab.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    }`}
                  >
                    {kab.isActive ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              )}
            </div>
            <div className="text-lg font-bold text-gray-400 dark:text-gray-500">#{index + 1}</div>
          </div>
        </div>
      ))}

      <footer>
        <button
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          onClick={() =>
            router.push(
              "/admin/data-master/wilayah-administratif/kota-kabupaten"
            )
          }
        >
          Lihat Semua Kota/Kabupaten
        </button>
      </footer>
    </div>
  );
};

export default KotaKabupatenDrawerContent;
