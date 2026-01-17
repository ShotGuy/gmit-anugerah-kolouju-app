import React, { useState } from 'react';
import { X, Download, CheckSquare, Square, FileText, FileSpreadsheet } from 'lucide-react';

import { Button } from './Button';

import { exportData, getAvailableFormats } from '@/utils/exportUtils';

export default function ExportModal({
  isOpen,
  onClose,
  data = [],
  columns = [],
  exportColumns = null,
  filename = 'export',
  title = 'Export Data',
}) {
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [selectedColumns, setSelectedColumns] = useState((exportColumns || columns).map(col => col.key));
  const [isExporting, setIsExporting] = useState(false);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [customTitle, setCustomTitle] = useState(title);

  const formats = getAvailableFormats();
  const columnsToUse = exportColumns || columns;

  // Toggle column selection
  const toggleColumn = (columnKey) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Select/deselect all columns
  const toggleAllColumns = () => {
    setSelectedColumns(prev =>
      prev.length === columnsToUse.length ? [] : columnsToUse.map(col => col.key)
    );
  };

  // Handle export
  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert('Pilih minimal satu kolom untuk diekspor');
      return;
    }

    setIsExporting(true);
    try {
      const options = {
        selectedColumns,
        title: includeTitle ? customTitle : null,
        orientation: selectedColumns.length > 6 ? 'landscape' : 'portrait',
      };

      const result = await exportData(selectedFormat, data, columnsToUse, filename, options);

      if (result.success) {
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Terjadi kesalahan saat mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset modal state when closed
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedColumns(columnsToUse.map(col => col.key));
      setSelectedFormat('xlsx');
      setIncludeTitle(true);
      setCustomTitle(title);
    }
  }, [isOpen, columnsToUse, title]);

  if (!isOpen) return null;

  const isAllSelected = selectedColumns.length === columnsToUse.length;
  const isPartialSelected = selectedColumns.length > 0 && selectedColumns.length < columnsToUse.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Export Data</h2>
          </div>
          <button
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Export Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-200">
              Format Export
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map((format) => (
                <button
                  key={format.value}
                  className={`p-3 border rounded-lg text-left transition-colors duration-200 ${
                    selectedFormat === format.value
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                  }`}
                  onClick={() => setSelectedFormat(format.value)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{format.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{format.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title Options (PDF/DOCX only) */}
          {(selectedFormat === 'pdf' || selectedFormat === 'docx') && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
                  onClick={() => setIncludeTitle(!includeTitle)}
                >
                  {includeTitle ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                  Sertakan judul
                </button>
              </div>
              {includeTitle && (
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                  placeholder="Masukkan judul dokumen"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              )}
            </div>
          )}

          {/* Column Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Pilih Kolom ({selectedColumns.length}/{columnsToUse.length})
              </label>
              <button
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                onClick={toggleAllColumns}
              >
                {isAllSelected ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 transition-colors duration-200">
              <div className="space-y-2">
                {columnsToUse.map((column) => (
                  <label
                    key={column.key}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200"
                  >
                    <button
                      className="flex items-center"
                      onClick={() => toggleColumn(column.key)}
                    >
                      {selectedColumns.includes(column.key) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200">{column.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto transition-colors duration-200">
                      ({column.type || 'text'})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Data Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
            <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
              <div className="flex justify-between mb-1">
                <span>Total baris:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{data.length}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Kolom yang dipilih:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedColumns.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 uppercase">{selectedFormat}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
          <Button
            disabled={isExporting}
            variant="outline"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            disabled={selectedColumns.length === 0}
            isLoading={isExporting}
            loadingText="Mengekspor..."
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}