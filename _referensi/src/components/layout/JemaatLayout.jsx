import RoleLayout from "./RoleLayout";

import { JemaatGuard } from "@/components/auth/RoleGuard";

export default function JemaatLayout({ children, userInfo = null }) {
  return (
    <JemaatGuard>
      <RoleLayout role="jemaat" userInfo={userInfo}>
        {children}
      </RoleLayout>
    </JemaatGuard>
  );
}
