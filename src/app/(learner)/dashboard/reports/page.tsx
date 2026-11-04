import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { ReportsListClient } from "@/components/reports/reports-list-client";

export const dynamic = "force-dynamic";

export default async function ReportsListPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let sessions: any[] = [];
  try {
    const userSessions = await AssessmentService.getUserSessions(user.userId, user.email);
    sessions = (userSessions || []).filter((s: any) => s.result || s.status === "COMPLETED" || s.status === "PROCESSING");
  } catch (e) {
    console.warn("Could not load user sessions for reports:", e);
    sessions = [];
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Báo Cáo Đánh Giá Khẩu Ngữ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Xem lại toàn bộ lịch sử báo cáo khảo thí, điểm số ngôn ngữ học 7 chiều kích và lộ trình cải thiện cá nhân hóa.
          </p>
        </div>

        <Link href="/dashboard/assessments" className="shrink-0">
          <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 shadow-sm">
            <Mic className="h-4 w-4" />
            <span>Làm Bài Thi Mới</span>
          </Button>
        </Link>
      </div>

      <ReportsListClient initialSessions={sessions} />
    </div>
  );
}
