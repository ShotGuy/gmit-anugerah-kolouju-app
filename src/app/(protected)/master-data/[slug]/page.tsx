"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { MASTER_DATASETS } from "@/constants/master-datasets";
import { MasterDataManager } from "@/components/modules/master-data/master-data-manager";
import { getMasterDataAction } from "@/actions/master-data";

export default function MasterDatasetPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : params?.slug ?? "";

  const config = MASTER_DATASETS.find((d) => d.slug === slug) ?? null;

  // If no slug in URL, redirect to first dataset
  useEffect(() => {
    if (!slug) {
      const first = MASTER_DATASETS[0];
      if (first) router.push(`/master-data/${first.slug}`);
    }
  }, [slug, router]);

  const { data: items, isLoading, error } = useQuery({
    queryKey: ["master-data", slug],
    queryFn: () => getMasterDataAction(slug),
    enabled: !!config,
    staleTime: 5 * 60 * 1000, // 5 minutes for master data
  });

  if (!config) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Data tidak ditemukan</h2>
        <p className="text-sm text-muted-foreground">Dataset dengan slug "{slug}" tidak tersedia.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <MasterDataManager
      key={config.slug}
      config={config}
      initialItems={items as any[]}
      isLoading={isLoading}
    />
  );
}
