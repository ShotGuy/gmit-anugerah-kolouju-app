"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/sidebar";

export const TopBar = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Gagal logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-card px-4 py-3 lg:justify-end">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <Button onClick={handleLogout} size="sm" variant="outline" disabled={loading}>
        {loading ? "Keluar..." : "Keluar"}
      </Button>
    </header>
  );
};

