import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import {
  Inter,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Merienda,
} from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LocaleSync } from "@/providers/LocaleSync";
import { AuthProvider } from "@/providers/AuthProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { AdminSettingsProvider } from "@/providers/AdminSettingsProvider";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "en") as string;

  // Dynamically import messages based on locale
  const messageImport = await import(`@/i18n/messages/${locale}.json`).catch(
    async () => import("@/i18n/messages/en.json")
  );
  const messages = messageImport.default;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} ${merienda.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans antialiased"
      >
        <ThemeProvider>
          <LocaleSync locale={locale} messages={messages}>
            <AdminSettingsProvider>
              <AuthProvider>
                <SettingsProvider>
                  <NavigationProgress />
                  {children}
                </SettingsProvider>
              </AuthProvider>
            </AdminSettingsProvider>
          </LocaleSync>
        </ThemeProvider>
      </body>
    </html>
  );
}
