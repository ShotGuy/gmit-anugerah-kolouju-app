import ProfileGrid from "@/components/profile/ProfileGrid";
import PageHeader from "@/components/ui/PageHeader";
import { useUser } from "@/hooks/useUser";

export default function ProfilePage() {
  const { user: authUser } = useUser();

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Pegawai", href: "/employee/dashboard" },
          { label: "Profile", href: "/employee/profile" },
          { label: "Detail", href: "/employee/profile" },
        ]}
        description={"Detail informasi profile"}
        title={"Profile"}
      />
      <ProfileGrid user={authUser} />
    </>
  );
}
