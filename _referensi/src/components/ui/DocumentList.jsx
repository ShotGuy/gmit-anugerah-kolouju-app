import { useState, useEffect } from 'react';
import { File, Eye, Trash2, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

const DocumentList = ({ jemaatId, userRole = 'USER' }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const documentTypeLabels = {
    'BAPTIS': 'Surat Baptis',
    'SIDI': 'Surat Sidi',
    'NIKAH': 'Surat Nikah'
  };

  const statusLabels = {
    'PENDING': { label: 'Menunggu Verifikasi', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
    'APPROVED': { label: 'Disetujui', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
    'REJECTED': { label: 'Ditolak', color: 'text-red-600 bg-red-50', icon: XCircle }
  };

  useEffect(() => {
    if (jemaatId) {
      fetchDocuments();
    }
  }, [jemaatId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dokumen/jemaat/${jemaatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        setError(data.message || 'Gagal mengambil data dokumen');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dokumenId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dokumen/delete/${dokumenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDocuments(documents.filter(doc => doc.id !== dokumenId));
      } else {
        setError(data.message || 'Gagal menghapus dokumen');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat menghapus dokumen');
    }
  };

  const handleVerification = async (dokumenId, status, catatan = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dokumen/verify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dokumenId,
          status,
          catatan
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchDocuments(); // Refresh the list
      } else {
        setError(data.message || 'Gagal verifikasi dokumen');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat verifikasi dokumen');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Memuat dokumen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchDocuments}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Belum ada dokumen yang diupload</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const status = statusLabels[doc.statusDokumen];
        const StatusIcon = status.icon;

        return (
          <div
            key={doc.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {documentTypeLabels[doc.tipeDokumen]}
                    </h4>
                    <p className="text-sm text-gray-600">{doc.namaFile}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>Upload: {formatDate(doc.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </span>
                </div>

                {doc.catatan && (
                  <div className={`p-3 rounded-lg text-sm mb-3 ${
                    doc.statusDokumen === 'REJECTED'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {doc.statusDokumen === 'REJECTED' && (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>
                          {doc.statusDokumen === 'REJECTED' ? 'Alasan Penolakan:' : 'Catatan:'}
                        </strong> {doc.catatan}
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
                <button
                  onClick={() => window.open(doc.urlFile, '_blank')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Lihat dokumen"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={doc.urlFile}
                  download={doc.namaFile}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download dokumen"
                >
                  <Download className="w-4 h-4" />
                </a>

                {(userRole === 'ADMIN' || doc.statusDokumen === 'PENDING') && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {userRole === 'ADMIN' && doc.statusDokumen === 'PENDING' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVerification(doc.id, 'APPROVED')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => {
                      const catatan = prompt('Masukkan alasan penolakan (opsional):');
                      if (catatan !== null) {
                        handleVerification(doc.id, 'REJECTED', catatan);
                      }
                    }}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DocumentList;