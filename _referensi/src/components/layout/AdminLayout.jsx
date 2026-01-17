import RoleLayout from "./RoleLayout";

import { AdminGuard } from "@/components/auth/RoleGuard";

export default function AdminLayout({ children, userInfo = null }) {
  return (
    <AdminGuard>
      <RoleLayout role="admin" userInfo={userInfo}>
        {children}
      </RoleLayout>
    </AdminGuard>
  );
}
