import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, Award, Clock, ChevronRight, Mic } from "lucide-react";
import { formatDate, formatScore, getScoreBadgeColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsListPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let sessions: any[] = [];
  try {
    const userSessions = await AssessmentService.getUserSessions(user.userId);
    sessions = (userSessions || []).filter((s: any) => s.status === "COMPLETED" && s.result);
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

      {sessions.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 text-center p-8 sm:p-14 rounded-3xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Chưa có bài thi nào hoàn thành
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Hãy tham gia bài thi phỏng vấn nói 5 giai đoạn đầu tiên cùng Giám khảo AI Lý để nhận báo cáo chẩn đoán chi tiết.
          </p>
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-6 rounded-2xl shadow-sm">
              Bắt đầu làm bài thi &rarr;
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sessions.map((session) => {
            const result = session.result;
            const scoreColor = result ? getScoreBadgeColor(result.overallScore) : "bg-slate-100 text-slate-700";

            return (
              <Card
                key={session.id}
                className="border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs"
              >
                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="cinnabar" className="text-[10px] font-bold">
                        {result?.hskEstimate || session.template?.targetLevel || "HSK"}
                      </Badge>
                      {result?.cefrEstimate && (
                        <Badge variant="outline" className="text-[10px] font-bold">
                          CEFR {result.cefrEstimate}
                        </Badge>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.completedAt || session.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {session.template?.title || "Bài khảo thí khẩu ngữ"}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                      {result?.performanceSummary || session.template?.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                    {result ? (
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Tổng điểm
                        </span>
                        <div className="text-2xl font-black text-rose-600 dark:text-rose-500">
                          {formatScore(result.overallScore)}
                          <span className="text-xs text-slate-400 font-normal"> / 100</span>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Đang xử lý</Badge>
                    )}

                    <Link href={`/dashboard/reports/${session.id}`}>
                      <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
