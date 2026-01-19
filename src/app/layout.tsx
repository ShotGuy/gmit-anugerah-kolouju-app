import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { AppToaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/providers/query-provider";
import { PwaInit } from "@/components/pwa-init";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GMIT Anugerah Koluju • Admin",
  description: "Dashboard pendataan jemaat GMIT Anugerah Koluju",
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-32x32.png",
    apple: "/logo-GMIT.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <AppToaster />
          <PwaInit />
        </QueryProvider>
      </body>
    </html>
  );
}
