import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { BetaNoticeModal } from "@/components/common/beta-notice-modal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bảng Điều Khiển Học Viên",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LearnerLayout({
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/60 dark:bg-slate-950 antialiased selection:bg-rose-500 selection:text-white print:bg-white print:block print:min-h-0">
      <BetaNoticeModal />
      <DashboardSidebar user={{ name: user.name, email: user.email, role: user.role }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto print:overflow-visible print:h-auto print:block">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
