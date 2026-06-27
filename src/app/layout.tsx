import type { Metadata } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { WhoopProvider } from "@/components/providers/WhoopProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sehi — Actionable Health Intelligence",
  description:
    "Sehi turns WHOOP data into action: Sehi Score, energy timeline, journal correlations, and AI coaching.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${geist.variable} ${notoArabic.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased font-sans">
        <LocaleProvider>
          <WhoopProvider>
            <AppShell>{children}</AppShell>
          </WhoopProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
