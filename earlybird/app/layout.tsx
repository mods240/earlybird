import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "アーリーバード - 焼き鳥屋ナビ",
  description: "全国の焼き鳥・串焼き店を地図で見つけるアプリ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "アーリーバード",
  },
  icons: { apple: "/earlybird-icon-192.png" },
  openGraph: {
    title: "アーリーバード🍢 - 焼き鳥屋ナビ",
    description: "全国の焼き鳥・串焼き店を地図で見つけるアプリ。",
    url: "https://earlybird.vercel.app",
    siteName: "アーリーバード",
    images: [{ url: "https://earlybird.vercel.app/earlybird-icon-512.png", width: 512, height: 512 }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "アーリーバード🍢 - 焼き鳥屋ナビ",
    description: "全国の焼き鳥・串焼き店を地図で見つけるアプリ。",
    images: ["https://earlybird.vercel.app/earlybird-icon-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="アーリーバード" />
        <link rel="icon" href="/earlybird-icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/earlybird-icon-192.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0822883607725147" crossOrigin="anonymous"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
