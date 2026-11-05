import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FirebaseSessionSync } from "@/components/auth/firebase-session-sync";
import { PageLoadingBar } from "@/components/common/page-loading-bar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

function getBaseUrl(): URL {
  let raw = process.env.NEXT_PUBLIC_APP_URL || "https://chat.classnia.id.vn";
  raw = raw.trim();
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = `https://${raw}`;
  }
  try {
    return new URL(raw);
  } catch {
    return new URL("https://chat.classnia.id.vn");
  }
}

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "Classnia AI | Khảo Thí Khẩu Ngữ Tiếng Trung Chuẩn HSK & HSKK",
    template: "%s | Classnia AI",
  },
  description:
    "Nền tảng khảo thí và chẩn đoán năng lực khẩu ngữ tiếng Trung chuẩn hóa bằng Giám khảo AI. Phỏng vấn giao tiếp tự nhiên 5 giai đoạn, chẩn đoán âm học và thang điểm 7 chiều chuẩn HSK 3.0 & HSKK.",
  keywords: [
    "Khảo thí khẩu ngữ tiếng Trung",
    "Thi thử HSK",
    "Luyện thi HSKK",
    "Phát âm tiếng Trung chuẩn",
    "Giám khảo AI HSK",
    "Classnia AI",
    "AI Chinese Speaking Assessment",
    "Oral Chinese Test",
    "Mandarin Fluency Assessment",
    "Chẩn đoán thanh điệu tiếng Trung",
    "Học tiếng Trung giao tiếp AI",
  ],
  authors: [{ name: "Classnia AI Team", url: baseUrl.toString() }],
  creator: "Classnia AI",
  publisher: "Classnia AI Education Systems",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
      "zh-CN": "/about",
      "en-US": "/about",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Classnia AI | Khảo Thí Khẩu Ngữ Tiếng Trung Chuẩn HSK",
    description:
      "Nền tảng khảo thí và chẩn đoán năng lực khẩu ngữ tiếng Trung chuẩn hóa ứng dụng Giám khảo AI và động cơ tâm trắc học 7 chiều.",
    url: baseUrl.toString(),
    siteName: "Classnia AI",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Classnia AI - Khảo Thí Khẩu Ngữ Tiếng Trung Chuẩn HSK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classnia AI | Khảo Thí Khẩu Ngữ Tiếng Trung Chuẩn HSK",
    description:
      "Khảo thí và chẩn đoán năng lực khẩu ngữ tiếng Trung chuẩn hóa bằng Giám khảo AI.",
    images: ["/og-image.png"],
    creator: "@classnia_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Classnia AI",
  alternateName: "Classnia AI HSK Assessment",
  url: baseUrl.toString(),
  logo: `${baseUrl.toString()}/icon-512.png`,
  description:
    "Nền tảng khảo thí và chẩn đoán năng lực khẩu ngữ tiếng Trung chuẩn hóa bằng Giám khảo AI.",
  sameAs: ["https://classnia.id.vn"],
};

const jsonLdApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Classnia AI",
  applicationCategory: "EducationalApplication",
  operatingSystem: "All modern web browsers",
  browserRequirements: "Requires JavaScript and Web Audio API support",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "VND",
  },
  description:
    "Hệ thống phỏng vấn thi nói tiếng Trung và chẩn đoán phát âm thanh điệu, ngữ pháp 7 chiều tự động bằng trí tuệ nhân tạo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-900 antialiased selection:bg-rose-500/20 selection:text-rose-600 dark:bg-slate-950 dark:text-slate-100 m-0 p-0">
        <PageLoadingBar />
        <FirebaseSessionSync />
        {children}
      </body>
    </html>
  );
}
