import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FirebaseSessionSync } from "@/components/auth/firebase-session-sync";

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

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: "Classnia AI | Standardized AI Chinese Speaking Assessment SaaS",
  description:
    "Professional AI-powered oral Chinese language proficiency assessment platform. Full-length natural conversation examination, acoustic diagnostics, and comprehensive 7-dimension psychometric reports.",
  keywords: [
    "AI Chinese Speaking Assessment",
    "Oral Chinese Test",
    "HSK Speaking Practice",
    "Mandarin Fluency Assessment",
    "Chinese Language SaaS",
  ],
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
    title: "Classnia AI | Khảo Thí Khẩu Ngữ Tiếng Trung",
    description: "Nền tảng khảo thí và chẩn đoán khẩu ngữ tiếng Trung chuẩn hóa bằng Giám khảo AI.",
    images: [{ url: "/og-image.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-900 antialiased selection:bg-rose-500/20 selection:text-rose-600 dark:bg-slate-950 dark:text-slate-100 m-0 p-0">
        <FirebaseSessionSync />
        {children}
      </body>
    </html>
  );
}
