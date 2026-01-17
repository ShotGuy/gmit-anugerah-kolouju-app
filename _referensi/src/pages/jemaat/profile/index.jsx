import { User } from 'lucide-react';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ProfileGrid from '@/components/profile/ProfileGrid';
import PageTitle from '@/components/ui/PageTitle';
import { useAuth } from '@/contexts/AuthContext';

export default function JemaatProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute allowedRoles="JEMAAT">
      <PageTitle title="Profil - GMIT Betlehem Oesapa Barat" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <User className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
                <p className="text-sm text-gray-600">Kelola informasi profil Anda</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <ProfileGrid user={user} />
        </main>
      </div>
    </ProtectedRoute>
  );
}