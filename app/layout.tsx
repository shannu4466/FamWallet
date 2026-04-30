import type { Metadata } from "next";
import { ReactNode } from "react";
import ThemeRegistry from "@/components/ThemeRegistry";
import "./globals.css";
import ProtectedRoute from "@/components/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "FamWallet",
  description: "Track family expenses with reports and analytics",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <ProtectedRoute>
              <main
                style={{
                  minHeight: "100vh",
                  padding: "24px",
                }}
              >
                {children}
              </main>
            </ProtectedRoute>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}