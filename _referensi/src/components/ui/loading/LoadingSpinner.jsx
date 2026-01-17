export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      <span className="ml-2 text-sm text-gray-500">Memuat data...</span>
    </div>
  );
}
