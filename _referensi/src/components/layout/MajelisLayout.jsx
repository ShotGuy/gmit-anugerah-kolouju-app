import RoleLayout from "./RoleLayout";

import { MajelisGuard } from "@/components/auth/RoleGuard";

export default function MajelisLayout({ children, userInfo = null }) {
  return (
    <MajelisGuard>
      <RoleLayout role="majelis" userInfo={userInfo}>
        {children}
      </RoleLayout>
    </MajelisGuard>
  );
}
