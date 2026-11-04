import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Phòng Thi Khảo Thí Khẩu Ngữ AI",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 m-0 p-0 fixed inset-0">
      {children}
    </div>
  );
}
