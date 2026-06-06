import type { Metadata, Viewport } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Merienda,
} from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { AdminSettingsProvider } from "@/providers/AdminSettingsProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const merienda = Merienda({
  subsets: ["latin"],
  variable: "--font-merienda",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ERVFlow — Business Operating Platform",
    template: "%s | ERVFlow",
  },
  description:
    "ERVFlow is a modern all-in-one business operating platform — CRM, CMS, SEO, Payments, Store, Email, and more.",
  keywords: [
    "business platform",
    "CRM",
    "CMS",
    "SaaS",
    "admin portal",
    "ERVFlow",
  ],
  authors: [{ name: "ERVFlow" }],
  robots: { index: true, follow: true },
  icons: {
    icon: "/icons/favicon.svg",
    shortcut: "/icons/favicon-16x16.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#070c18" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans antialiased"
      >
        <ThemeProvider>
          <AdminSettingsProvider>
            <AuthProvider>
              <SettingsProvider>{children}</SettingsProvider>
            </AuthProvider>
          </AdminSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
