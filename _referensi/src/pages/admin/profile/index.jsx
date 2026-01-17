import ProfileGrid from "@/components/profile/ProfileGrid";
import PageHeader from "@/components/ui/PageHeader";
import { useUser } from "@/hooks/useUser";

export default function ProfilePage() {
  const { user: authUser } = useUser();

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Profile", href: "/admin/profile" },
          { label: "Detail", href: "/admin/profile" },
        ]}
        description={"Detail informasi profile"}
        title={"Profile"}
      />
      <ProfileGrid user={authUser} />
    </>
  );
}
