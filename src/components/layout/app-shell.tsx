import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

type Props = {
  children: ReactNode;
};

export const AppShell = ({ children }: Props) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  </div>
);

