import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TelegramProvider } from "@/components/TelegramProvider";
import "./globals.css";

// latin-ext covers Uzbek latin (oʻ, gʻ, sh, ch), cyrillic covers Russian.
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Slaydchibot — karusel muharriri",
  description: "Instagram va Telegram uchun karusel-postlar muharriri",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${montserrat.variable}`}>
      <body className="bg-tg-bg font-sans text-tg-text antialiased">
        <NextIntlClientProvider messages={messages}>
          <TelegramProvider>{children}</TelegramProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
