import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HuáVocal AI | Standardized AI Chinese Speaking Assessment SaaS",
  description:
    "Professional AI-powered oral Chinese language proficiency assessment platform. Full-length natural conversation examination, acoustic diagnostics, and comprehensive 7-dimension psychometric reports.",
  keywords: [
    "AI Chinese Speaking Assessment",
    "Oral Chinese Test",
    "HSK Speaking Practice",
    "Mandarin Fluency Assessment",
    "Chinese Language SaaS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-slate-50/50 text-slate-900 antialiased selection:bg-rose-500/20 selection:text-rose-600 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
