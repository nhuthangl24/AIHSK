import type { Metadata } from "next";
import "./globals.css";
import { FirebaseSessionSync } from "@/components/auth/firebase-session-sync";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://aihsk.classnia.id.vn"),
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
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-900 antialiased selection:bg-rose-500/20 selection:text-rose-600 dark:bg-slate-950 dark:text-slate-100">
        <FirebaseSessionSync />
        {children}
      </body>
    </html>
  );
}
