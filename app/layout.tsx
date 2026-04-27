import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeInitScript } from "@/components/layout/theme-init-script";
import { PWARegister } from "@/components/pwa/pwa-register";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Offline POS Invoice",
  description: "Offline-first POS Invoice & Billing System",
  applicationName: "Offline POS",
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmMono.variable} antialiased`}>
        <ThemeInitScript />
        <PWARegister />
        <KeyboardShortcuts />
        <AppShell>{children}</AppShell>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
