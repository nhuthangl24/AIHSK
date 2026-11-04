import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, Award, Clock } from "lucide-react";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Báo Cáo Đánh Giá Khẩu Ngữ
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Xem lại toàn bộ lịch sử báo cáo khảo thí, điểm số ngôn ngữ học 7 chiều kích và lộ trình cải thiện cá nhân hóa.
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 text-center p-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Chưa có bài thi nào hoàn thành
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Hãy tham gia bài thi phỏng vấn nói 5 giai đoạn đầu tiên cùng Giám khảo AI Lý để nhận báo cáo chẩn đoán chi tiết.
          </p>
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Bắt đầu làm bài thi &rarr;
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const result = session.result;
            const scoreColor = result ? getScoreBadgeColor(result.overallScore) : "bg-slate-100 text-slate-700";

            return (
              <Card
                key={session.id}
                className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {session.template?.targetLevel || "HSK"}
                      </Badge>
                      {result?.hskEstimate && (
                        <Badge variant="cinnabar" className="text-xs">
                          {result.hskEstimate}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.completedAt || session.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {session.template?.title || "Bài khảo thí khẩu ngữ"}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                      {result?.performanceSummary || session.template?.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    {result ? (
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Điểm số
                        </span>
                        <span className={`text-xl font-extrabold ${scoreColor}`}>
                          {formatScore(result.overallScore)}
                          <span className="text-xs text-slate-400 font-normal"> / 100</span>
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline">Đang xử lý</Badge>
                    )}

                    <Link href={`/dashboard/reports/${session.id}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        <span>Chi tiết</span>
                        <ArrowRight className="h-3.5 w-3.5" />
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
