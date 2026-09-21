import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import { AppShell } from "@/components/shell/AppShell";
import { routing } from "@/i18n/routing";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techradar.uz";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("homeTitle"),
      template: "%s | YaRato",
    },
    description: t("homeDescription"),
    alternates: {
      canonical: locale === "uz" ? "/" : `/${locale}`,
      languages: {
        uz: "/",
        ru: "/ru",
        en: "/en",
        "x-default": "/",
      },
    },
    other: {
      "application/rss+xml": `${SITE_URL}${locale === "uz" ? "" : `/${locale}`}/feed`,
    },
    openGraph: {
      type: "website",
      siteName: "YaRato",
      title: t("homeTitle"),
      description: t("homeDescription"),
      locale,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "YaRato - Узбекистан стартапларининг радари",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
      images: ["/opengraph-image.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthModalProvider
            telegramBot={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
          >
            <AppShell>{children}</AppShell>
          </AuthModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
