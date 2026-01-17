import { AlertCircle } from "lucide-react";

export default function PendetaAccessRestriction({
  message = "Anda tidak dapat melakukan tindakan ini sebagai Pendeta",
}) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-700 flex items-center">
      <AlertCircle className="h-4 w-4 mr-2" />
      <div>
        <p className="text-sm font-medium">Akses Dibatasi</p>
        <p className="text-xs">{message}</p>
      </div>
    </div>
  );
}
