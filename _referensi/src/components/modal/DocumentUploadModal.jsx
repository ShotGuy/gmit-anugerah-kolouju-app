import { useState } from 'react';
import { X, Upload, File, AlertCircle, CheckCircle2 } from 'lucide-react';

const DocumentUploadModal = ({ isOpen, onClose, jemaatId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipeDokumen, setTipeDokumen] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const documentTypes = [
    { value: 'BAPTIS', label: 'Surat Baptis' },
    { value: 'SIDI', label: 'Surat Sidi' },
    { value: 'NIKAH', label: 'Surat Nikah' }
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setError('');
    setSuccess('');

    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipe file harus PDF, PNG, atau JPG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipeDokumen) {
      setError('Pilih file dan tipe dokumen terlebih dahulu');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('dokumen', selectedFile);
      formData.append('jemaatId', jemaatId);
      formData.append('tipeDokumen', tipeDokumen);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/dokumen/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Dokumen berhasil diupload');
        setSelectedFile(null);
        setTipeDokumen('');
        if (onUploadSuccess) {
          onUploadSuccess(data.data);
        }
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Gagal upload dokumen');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setTipeDokumen('');
    setError('');
    setSuccess('');
    setIsUploading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Dokumen
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Dokumen
            </label>
            <select
              value={tipeDokumen}
              onChange={(e) => setTipeDokumen(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={isUploading}
            >
              <option value="">Pilih Tipe Dokumen</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Dokumen
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Klik untuk upload
                  </span>{' '}
                  atau drag and drop
                </div>
                <div className="text-xs text-gray-500">
                  PDF, PNG, JPG (max. 2MB)
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-3 flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !tipeDokumen || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isUploading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;