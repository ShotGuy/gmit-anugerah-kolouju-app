import RoleLayout from "./RoleLayout";

import { EmployeeGuard } from "@/components/auth/RoleGuard";

export default function EmployeeLayout({ children, userInfo = null }) {
  return (
    <EmployeeGuard>
      <RoleLayout role="employee" userInfo={userInfo}>
        {children}
      </RoleLayout>
    </EmployeeGuard>
  );
}
