import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';
import dokumenJemaatService from '@/services/dokumenJemaatService';

const DokumenJemaatProgressBar = ({ jemaatId }) => {
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['dokumen-jemaat-progress', jemaatId],
    queryFn: async () => {
      if (!jemaatId) return null;

      // Since we don't have a progress endpoint, we'll get documents and calculate
      const response = await dokumenJemaatService.getByJemaatId(jemaatId);
      if (!response.success) {
        throw new Error(response.message || 'Gagal mengambil data progress');
      }

      const documents = response.data || [];
      const requiredDocumentTypes = ['BAPTIS', 'SIDI', 'NIKAH'];

      const dokumenApproved = documents.filter(doc => doc.statusDokumen === 'APPROVED').length;
      const dokumenUploaded = documents.length;

      // Count required documents for progress calculation
      const requiredDocsApproved = documents.filter(doc =>
        requiredDocumentTypes.includes(doc.tipeDokumen) && doc.statusDokumen === 'APPROVED'
      ).length;
      const totalRequiredDokumen = requiredDocumentTypes.length;

      const uploadedTypes = [...new Set(documents.map(doc => doc.tipeDokumen))];
      const missingRequiredDocuments = requiredDocumentTypes.filter(type => !uploadedTypes.includes(type));

      const progressPercent = Math.round((requiredDocsApproved / totalRequiredDokumen) * 100);

      return {
        progress: progressPercent,
        missingDocuments: missingRequiredDocuments,
        dokumenUploaded,
        dokumenApproved,
        totalDokumen: totalRequiredDokumen,
        documents // Include all documents for display
      };
    },
    enabled: !!jemaatId,
  });

  const documentTypes = [
    { key: 'BAPTIS', label: 'Surat Baptis', color: 'bg-blue-500' },
    { key: 'SIDI', label: 'Surat Sidi', color: 'bg-green-500' },
    { key: 'NIKAH', label: 'Surat Nikah', color: 'bg-purple-500' }
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2 border border-red-200 dark:border-red-800">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{error.message}</span>
      </div>
    );
  }

  if (!progress) return null;

  const { progress: progressPercent, missingDocuments, dokumenUploaded, dokumenApproved, totalDokumen, documents } = progress;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Progress Dokumen</span>
        </h3>
        <span className="text-2xl font-bold text-blue-600">{progressPercent}%</span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Dokumen Disetujui</span>
          <span>{dokumenApproved} dari {totalDokumen}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
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
            <div key={docType.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isUploaded ? docType.color : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{docType.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {isUploaded ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Uploaded
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30">
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
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Dokumen yang belum diupload:</p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
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

      {/* Additional Documents Section */}
      {documents && documents.filter(doc => doc.tipeDokumen === 'LAINNYA').length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Dokumen Tambahan:</p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                {documents.filter(doc => doc.tipeDokumen === 'LAINNYA').map((doc) => (
                  <li key={doc.id} className="flex items-center space-x-1">
                    <span>•</span>
                    <span>{doc.judulDokumen || 'Dokumen Lainnya'}</span>
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      doc.statusDokumen === 'APPROVED'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : doc.statusDokumen === 'REJECTED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {doc.statusDokumen === 'APPROVED' ? 'Disetujui' :
                       doc.statusDokumen === 'REJECTED' ? 'Ditolak' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{dokumenUploaded}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Total Upload</div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{dokumenApproved}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Disetujui</div>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{missingDocuments.length}</div>
          <div className="text-xs text-gray-700 dark:text-gray-400">Belum Upload</div>
        </div>
      </div>
    </div>
  );
};

export default DokumenJemaatProgressBar;