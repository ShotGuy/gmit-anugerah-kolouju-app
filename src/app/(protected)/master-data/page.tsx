import { redirect } from "next/navigation";

import { MASTER_DATASETS } from "@/constants/master-datasets";

export default function MasterDataPage() {
  const first = MASTER_DATASETS[0];

  redirect(`/master-data/${first.slug}`);
}

