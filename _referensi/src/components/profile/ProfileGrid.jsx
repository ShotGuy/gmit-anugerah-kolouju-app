import JemaatProfileSection from "./JemaatProfileSection";
import MajelisProfileSection from "./MajelisProfileSection";
import UserProfileSection from "./UserProfileSection";

export default function ProfileGrid({ user }) {
  if (!user) return null;

  return (
    <div className="space-y-6 p-3">
      {/* User Profile Section - Always show */}
      <UserProfileSection user={user} />

      {/* Role-based Profile Sections */}
      {user.role === "JEMAAT" && user.jemaat && (
        <JemaatProfileSection user={user} />
      )}

      {user.role === "MAJELIS" && user.majelis && (
        <MajelisProfileSection user={user} />
      )}

      {/* {user.role === "EMPLOYEE" && (
        <EmployeeProfileSection user={user} />
      )} */}

      {/* Admin and Pendeta roles can be added here when needed */}
      {user.role === "ADMIN" && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Administrator</h3>
          <p className="text-red-600">
            Akses penuh sistem administrasi GMIT Imanuel Oepura
          </p>
        </div>
      )}

      {user.role === "PENDETA" && (
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Pendeta</h3>
          <p className="text-purple-600">Pelayan rohani GMIT Imanuel Oepura</p>
        </div>
      )}
    </div>
  );
}
