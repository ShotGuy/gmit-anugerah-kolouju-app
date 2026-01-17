import { useQuery } from "@tanstack/react-query";
import {
    CheckCircle,
    Eye,
    Key,
    Shield,
    Trash,
    User,
    UserPlus,
    XCircle
} from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListGrid from "@/components/ui/ListGrid";
import useConfirm from "@/hooks/useConfirm";
import { useUser } from "@/hooks/useUser";
import pegawaiService from "@/services/pegawaiService";

export default function PegawaiPage() {
    const router = useRouter();
    const confirm = useConfirm();
    const [viewData, setViewData] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const { user: authData } = useUser();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["pegawai"],
        queryFn: () => pegawaiService.getAll(),
    });

    const columns = [
        {
            key: "jemaat.nama",
            label: "Nama Jemaat",
            type: "text",
            render: (value, item) => (
                <span className="flex items-center text-sm font-medium">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    {item.jemaat?.nama || "-"}
                </span>
            ),
        },
        {
            key: "jenisJabatan",
            label: "Jabatan",
            type: "text",
            render: (value, item) => (
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {value?.namaJabatan || "-"}
                </span>
            ),
        },
        {
            key: "User",
            label: "Username",
            type: "text",
            render: (value) => (
                <span className="text-sm font-mono text-gray-600">
                    {value?.username || "-"}
                </span>
            ),
        },
        {
            key: "permissions",
            label: "Hak Akses",
            type: "text",
            render: (_, item) => (
                <div className="flex gap-1">
                    {item.canCreateJadwal && <span title="Buat Jadwal" className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">Jadwal</span>}
                    {item.canManageKeuangan && <span title="Kelola Keuangan" className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px]">Keuangan</span>}
                    {item.canManageWarta && <span title="Kelola Warta" className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">Warta</span>}
                    {item.canManageJemaat && <span title="Kelola Jemaat" className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px]">Jemaat</span>}
                    {(!item.canCreateJadwal && !item.canManageKeuangan && !item.canManageWarta && !item.canManageJemaat) && <span className="text-gray-400 text-xs">-</span>}
                </div>
            ),
        },
        {
            key: "isActive",
            label: "Status",
            type: "boolean",
            render: (value) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${value
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {value ? "Aktif" : "Nonaktif"}
                </span>
            ),
        },
    ];

    const handleDelete = (item) => {
        confirm.showConfirm({
            title: "Hapus Pegawai",
            message: `Apakah Anda yakin ingin menghapus pegawai "${item.jemaat?.nama}"? Akun pengguna terkait juga akan dihapus. Data yang sudah dihapus tidak dapat dikembalikan.`,
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await pegawaiService.delete(item.id);
                    refetch();
                } catch (error) {
                    console.error("Error deleting pegawai:", error);
                }
            },
        });
    };

    const handleView = (item) => {
        setViewData(item);
        setIsViewModalOpen(true);
    };

    const handleCreate = () => {
        router.push("/admin/pegawai/create");
    };

    return (
        <>
            <ListGrid
                breadcrumb={[
                    { label: "Dashboard", href: "/admin/dashboard" },
                    { label: "Pegawai", href: "/admin/pegawai" },
                ]}
                columns={columns}
                customAddButton={{
                    ...(authData?.isAdmin
                        ? {
                            onClick: handleCreate,
                            variant: "primary",
                            icon: <UserPlus className="w-4 h-4 mr-2" />,
                            text: "Tambah Pegawai",
                        }
                        : {}),
                }}
                data={data?.data?.items || []}
                description="Kelola data pegawai gereja dan hak akses mereka"
                exportFilename="pegawai"
                exportable={true}
                isLoading={isLoading}
                rowActionType="horizontal"
                rowActions={[
                    {
                        icon: Eye,
                        onClick: handleView,
                        variant: "outline",
                        tooltip: "Lihat detail",
                    },
                    ...(authData?.isAdmin
                        ? [
                            {
                                icon: Trash,
                                onClick: handleDelete,
                                variant: "outline",
                                tooltip: "Hapus pegawai",
                            },
                        ]
                        : []),
                ]}
                searchPlaceholder="Cari nama pegawai..."
                title="Manajemen Pegawai"
                onAdd={authData?.isAdmin ? handleCreate : undefined}
            />

            <ConfirmDialog
                cancelText={confirm.config.cancelText}
                confirmText={confirm.config.confirmText}
                isOpen={confirm.isOpen}
                message={confirm.config.message}
                title={confirm.config.title}
                variant={confirm.config.variant}
                onClose={confirm.hideConfirm}
                onConfirm={confirm.handleConfirm}
            />

            {isViewModalOpen && viewData && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity" />

                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                            <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                                            {viewData.jemaat?.nama || "Nama Tidak Terdaftar"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {viewData.jenisJabatan?.namaJabatan}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Permissions Section */}
                                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Key className="w-3 h-3" /> Hak Akses (Permissions)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <PermissionItem label="Buat Jadwal" active={viewData.canCreateJadwal} />
                                            <PermissionItem label="Kelola Keuangan" active={viewData.canManageKeuangan} />
                                            <PermissionItem label="Kelola Warta" active={viewData.canManageWarta} />
                                            <PermissionItem label="Kelola Data Jemaat" active={viewData.canManageJemaat} />
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    {viewData.User && (
                                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                                            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Akun Login
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500 text-xs block">Username</span>
                                                    <span className="font-medium text-gray-900">{viewData.User.username}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 text-xs block">Email</span>
                                                    <span className="font-medium text-gray-900">{viewData.User.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                                    type="button"
                                    onClick={() => setIsViewModalOpen(false)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function PermissionItem({ label, active }) {
    return (
        <div className={`flex items-center gap-2 ${active ? 'text-gray-900' : 'text-gray-400'}`}>
            {active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4" />}
            <span>{label}</span>
        </div>
    )
}
