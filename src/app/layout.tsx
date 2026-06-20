import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import MobileShell from "@/components/MobileShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormCheck — AI Exercise Form Checker",
  description: "Real-time exercise form analysis using AI pose estimation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full">
        <AuthProvider>
          <WorkoutProvider>
            <MobileShell>{children}</MobileShell>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  color: "#0f172a",
                  boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)",
                  borderRadius: "16px",
                  fontSize: "14px",
                },
              }}
            />
          </WorkoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
