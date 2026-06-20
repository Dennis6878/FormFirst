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
                  background: "#18181b",
                  border: "1px solid #27272a",
                  color: "#ededed",
                },
              }}
            />
          </WorkoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
