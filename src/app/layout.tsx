import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import QueryProvider from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineProvider } from "@/components/offline-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`,
  ),
  title: "Hackerz GatePass",
  description:
    "A powerful and intuitive learning management system for managing courses, students, and educational content.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "Hackerz GatePass",
    description:
      "A powerful and intuitive learning management system for managing courses, students, and educational content.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hackerz GatePass",
    description:
      "A powerful and intuitive learning management system for managing courses, students, and educational content.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.ico" />
      </head>
      <body className={GeistSans.className}>
        <AuthProvider>
          <QueryProvider>
            <TooltipProvider>
              <OfflineProvider>{children}</OfflineProvider>
            </TooltipProvider>
          </QueryProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
