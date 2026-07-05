import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Telegram opens the app inside a WebView; allow embedding.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors https://web.telegram.org https://*.telegram.org 'self'" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
