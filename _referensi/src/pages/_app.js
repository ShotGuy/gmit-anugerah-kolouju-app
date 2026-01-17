import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import AdminLayout from "@/components/layout/AdminLayout";
import EmployeeLayout from "@/components/layout/EmployeeLayout";
import Footer from "@/components/layout/Footer";
import JemaatLayout from "@/components/layout/JemaatLayout";
import MajelisLayout from "@/components/layout/MajelisLayout";
// import Navigation from "@/components/layout/navigation";
// import InstallPrompt from "@/components/pwa/InstallPrompt";
// import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";
import { AuthProvider } from "@/contexts/AuthContext";
// import { PWAProvider } from "@/contexts/PWAContext";
import MainNavigation from "@/components/layout/MainNavigation";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";
import { PWAProvider } from "@/contexts/PWAContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { queryClient } from "@/lib/queryClient";
import "@/styles/globals.css";
import "leaflet/dist/leaflet.css";

export default function App({ Component, pageProps, router }) {
  const pathname = router.pathname;

  // Check if current route is role-based page
  const isAdminPage = pathname.startsWith("/admin");
  const isJemaatPage = pathname.startsWith("/jemaat");
  const isMajelisPage = pathname.startsWith("/majelis");
  const isEmployeePage = pathname.startsWith("/employee");
  const isOnboardingPage = pathname === "/onboarding";

  // If the component has a custom layout, use it
  if (Component.getLayout) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {Component.getLayout(<Component {...pageProps} />)}
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  // For role-based pages, render with appropriate layout
  if (isAdminPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <AdminLayout>
              <Toaster richColors position="top-right" />

              <Component {...pageProps} />
            </AdminLayout>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  if (isJemaatPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <JemaatLayout>
              <Toaster richColors position="top-right" />

              <Component {...pageProps} />
            </JemaatLayout>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  if (isMajelisPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <MajelisLayout>
              <Toaster richColors position="top-right" />

              <Component {...pageProps} />
            </MajelisLayout>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  if (isEmployeePage) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <EmployeeLayout>
              <Toaster richColors position="top-right" />

              <Component {...pageProps} />
            </EmployeeLayout>
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  // For onboarding page, render without navigation and footer
  if (isOnboardingPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster richColors position="top-right" />
            <Component {...pageProps} />
          </AuthProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  // For other pages (public pages), render with default layout
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PWAProvider>
          <AuthProvider>
            <MainNavigation>
              <Toaster richColors position="top-right" />
              <PWAInstallBanner />

              <Component {...pageProps} />
              <Footer />
              {/* <InstallPrompt /> */}
            </MainNavigation>
          </AuthProvider>
        </PWAProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
