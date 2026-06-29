import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://techradar.uz";

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
      template: "%s | TechRadar.uz",
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
      siteName: "TechRadar.uz",
      title: t("homeTitle"),
      description: t("homeDescription"),
      locale,
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "TechRadar.uz - Узбекистан стартапларининг радари",
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <AuthModalProvider
            telegramBot={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
          >
            <DemoBanner />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
