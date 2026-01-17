import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Home,
  MessageSquare,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DokumenJemaatPreviewModal from "@/components/dokumen-jemaat/DokumenJemaatPreviewModal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageTitle from "@/components/ui/PageTitle";
import { useAuth } from "@/contexts/AuthContext";
import useConfirm from "@/hooks/useConfirm";
import dokumenJemaatService from "@/services/dokumenJemaatService";
import { showToast } from "@/utils/showToast";

export default function MajelisDokumenJemaatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const confirm = useConfirm();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("ALL");
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    document: null,
  });
  const [rejectNote, setRejectNote] = useState("");
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    document: null,
  });

  const documentTypeLabels = {
    BAPTIS: "Surat Baptis",
    SIDI: "Surat Sidi",
    NIKAH: "Surat Nikah",
    LAINNYA: "Lainnya",
  };

  const statusConfig = {
    PENDING: {
      label: "Menunggu Verifikasi",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    APPROVED: {
      label: "Disetujui",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Ditolak",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
  };

  // Fetch documents data using TanStack Query
  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["majelis-dokumen-jemaat"],
    queryFn: () => dokumenJemaatService.getMajelisRayonDocuments(),
    enabled: !!user?.majelis?.idRayon,
  });

  const rayonData = documentsData?.data?.rayon;
  const documents = documentsData?.data?.dokumen || [];

  // Filter documents using useMemo for performance
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.jemaat.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.namaFile.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.jemaat.keluarga.noBagungan.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((doc) => doc.statusDokumen === statusFilter);
    }

    // Filter by document type
    if (documentTypeFilter !== "ALL") {
      filtered = filtered.filter(
        (doc) => doc.tipeDokumen === documentTypeFilter
      );
    }

    return filtered;
  }, [documents, searchTerm, statusFilter, documentTypeFilter]);

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: ({ dokumenId, status, catatan }) =>
      dokumenJemaatService.verify(dokumenId, status, catatan),
    onSuccess: () => {
      showToast({
        title: "Berhasil",
        description: "Dokumen berhasil diverifikasi",
        color: "success",
      });
      queryClient.invalidateQueries(["majelis-dokumen-jemaat"]);
      setRejectModal({ isOpen: false, document: null });
      setRejectNote("");
    },
    onError: (error) => {
      showToast({
        title: "Gagal",
        description:
          error.response?.data?.message || "Gagal verifikasi dokumen",
        color: "error",
      });
    },
  });

  const handleVerification = (dokumenId, status, catatan = "") => {
    verifyMutation.mutate({ dokumenId, status, catatan });
  };

  const openRejectModal = (document) => {
    setRejectModal({ isOpen: true, document });
    setRejectNote("");
  };

  const openPreviewModal = (document) => {
    setPreviewModal({ isOpen: true, document });
  };

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, document: null });
  };

  const confirmReject = () => {
    if (!rejectNote.trim()) {
      showToast({
        title: "Peringatan",
        description: "Harap masukkan alasan penolakan",
        color: "warning",
      });

      return;
    }
    handleVerification(rejectModal.document.id, "REJECTED", rejectNote);
  };

  const handleBack = () => {
    router.push("/majelis/dashboard");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatistics = () => {
    const total = documents.length;
    const pending = documents.filter(
      (doc) => doc.statusDokumen === "PENDING"
    ).length;
    const approved = documents.filter(
      (doc) => doc.statusDokumen === "APPROVED"
    ).length;
    const rejected = documents.filter(
      (doc) => doc.statusDokumen === "REJECTED"
    ).length;

    return { total, pending, approved, rejected };
  };

  // Check if user has majelis data with rayon
  if (!user?.majelis?.idRayon) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Akses Terbatas</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Anda belum memiliki rayon yang ditugaskan. Hubungi admin untuk
                mengatur rayon Anda.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles="MAJELIS">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <span className="text-gray-600">Memuat data dokumen...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const stats = getStatistics();

  return (
    <ProtectedRoute allowedRoles="MAJELIS">
      <PageTitle title="Verifikasi Dokumen Jemaat" />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Verifikasi Dokumen Jemaat
                </h1>
                <div className="flex items-center text-gray-600">
                  <Home className="w-4 h-4 mr-2" />
                  <span>Rayon: {rayonData?.namaRayon || "Memuat..."}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Dokumen
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Menunggu</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disetujui</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.approved}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ditolak</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.rejected}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <span>
              {error.message || "Terjadi kesalahan saat mengambil data"}
            </span>
            <Button
              className="ml-auto"
              size="sm"
              variant="outline"
              onClick={() => refetch()}
            >
              Coba lagi
            </Button>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cari nama jemaat, file, atau nomor bangunan..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="APPROVED">Disetujui</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={documentTypeFilter}
                  onChange={(e) => setDocumentTypeFilter(e.target.value)}
                >
                  <option value="ALL">Semua Jenis</option>
                  <option value="BAPTIS">Surat Baptis</option>
                  <option value="SIDI">Surat Sidi</option>
                  <option value="NIKAH">Surat Nikah</option>
                </select>
                <Button
                  disabled={isLoading}
                  variant="outline"
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="ml-2">Refresh</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>
                Dokumen Jemaat di Rayon {rayonData?.namaRayon} (
                {filteredDocuments.length} dari {documents.length} dokumen)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">
                  {documents.length === 0
                    ? "Belum ada dokumen dari jemaat di rayon ini"
                    : "Tidak ada dokumen yang sesuai dengan filter"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredDocuments.map((doc) => {
                  const status = statusConfig[doc.statusDokumen];
                  const StatusIcon = status.icon;

                  return (
                    <div key={doc.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {doc.tipeDokumen === 'LAINNYA' && doc.judulDokumen
                                  ? doc.judulDokumen
                                  : documentTypeLabels[doc.tipeDokumen]}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {doc.namaFile}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span>
                              Jemaat: <strong>{doc.jemaat.nama}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              No. Bangunan: {doc.jemaat.keluarga.noBagungan}
                            </span>
                            <span>•</span>
                            <span>Upload: {formatDate(doc.createdAt)}</span>
                          </div>

                          <div className="flex items-center space-x-2 mb-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}
                            >
                              <StatusIcon className="w-4 h-4 mr-1" />
                              {status.label}
                            </span>
                          </div>

                          {doc.catatan && (
                            <div className="p-3 bg-gray-100 rounded-lg text-sm mb-3">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong>Catatan:</strong> {doc.catatan}
                                </div>
                              </div>
                            </div>
                          )}

                          {doc.verifiedAt && (
                            <p className="text-xs text-gray-500">
                              Diverifikasi pada: {formatDate(doc.verifiedAt)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPreviewModal(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button asChild size="sm" variant="outline">
                            <a download={doc.namaFile} href={doc.urlFile}>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>

                          {doc.statusDokumen === "PENDING" && (
                            <>
                              <Button
                                disabled={verifyMutation.isPending}
                                size="sm"
                                onClick={() =>
                                  handleVerification(doc.id, "APPROVED")
                                }
                              >
                                {verifyMutation.isPending
                                  ? "Memproses..."
                                  : "Setujui"}
                              </Button>
                              <Button
                                disabled={verifyMutation.isPending}
                                size="sm"
                                variant="destructive"
                                onClick={() => openRejectModal(doc)}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reject Modal */}
        {rejectModal.isOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Tolak Dokumen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Dokumen:{" "}
                  <strong>
                    {rejectModal.document?.tipeDokumen === 'LAINNYA' && rejectModal.document?.judulDokumen
                      ? rejectModal.document.judulDokumen
                      : documentTypeLabels[rejectModal.document?.tipeDokumen]}
                  </strong>
                  <br />
                  Jemaat: <strong>{rejectModal.document?.jemaat.nama}</strong>
                </p>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan alasan penolakan..."
                  rows={4}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                />
                <div className="flex items-center justify-end space-x-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setRejectModal({ isOpen: false, document: null })
                    }
                  >
                    Batal
                  </Button>
                  <Button variant="destructive" onClick={confirmReject}>
                    Tolak Dokumen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview Modal */}
        {previewModal.isOpen && previewModal.document && (
          <DokumenJemaatPreviewModal
            isOpen={previewModal.isOpen}
            onClose={closePreviewModal}
            document={previewModal.document}
          />
        )}
      </div>

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
    </ProtectedRoute>
  );
}
