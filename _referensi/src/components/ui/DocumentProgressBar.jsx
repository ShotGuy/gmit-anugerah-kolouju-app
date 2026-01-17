import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

const DocumentProgressBar = ({ jemaatId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const documentTypes = [
    { key: 'BAPTIS', label: 'Surat Baptis', color: 'bg-blue-500' },
    { key: 'SIDI', label: 'Surat Sidi', color: 'bg-green-500' },
    { key: 'NIKAH', label: 'Surat Nikah', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    if (jemaatId) {
      fetchProgress();
    }
  }, [jemaatId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/dokumen/progress/${jemaatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProgress(data.data);
      } else {
        setError(data.message || 'Gagal mengambil data progress');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!progress) return null;

  const { progress: progressPercent, missingDocuments, dokumenUploaded, dokumenApproved, totalDokumen } = progress;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Progress Dokumen</span>
        </h3>
        <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Dokumen Disetujui</span>
          <span>{dokumenApproved} dari {totalDokumen}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        {documentTypes.map((docType) => {
          const isUploaded = !missingDocuments.includes(docType.key);
          return (
            <div key={docType.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isUploaded ? docType.color : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-900">{docType.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {isUploaded ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Uploaded
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-700 bg-yellow-100">
                    <Clock className="w-3 h-3 mr-1" />
                    Belum Upload
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {missingDocuments.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Dokumen yang belum diupload:</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {missingDocuments.map((docType) => {
                  const docLabel = documentTypes.find(d => d.key === docType)?.label;
                  return (
                    <li key={docType} className="flex items-center space-x-1">
                      <span>•</span>
                      <span>{docLabel}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{dokumenUploaded}</div>
          <div className="text-xs text-blue-700">Total Upload</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{dokumenApproved}</div>
          <div className="text-xs text-green-700">Disetujui</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">{missingDocuments.length}</div>
          <div className="text-xs text-gray-700">Belum Upload</div>
        </div>
      </div>
    </div>
  );
};

export default DocumentProgressBar;