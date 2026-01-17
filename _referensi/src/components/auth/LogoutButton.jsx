import { LogOut } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

const LogoutButton = ({ className = "", variant = "primary" }) => {
  const { logout, loading } = useAuth();

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
    }
  };

  const baseClasses = "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
    ghost: "border-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500"
  };

  const variantClasses = variants[variant] || variants.primary;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={loading}
      onClick={handleLogout}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Keluar...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </>
      )}
    </button>
  );
};

export default LogoutButton;