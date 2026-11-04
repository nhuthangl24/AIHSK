import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { assessmentStore } from "@/lib/db/assessment-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Award,
  BarChart2,
  CheckCircle2,
  Mic,
  Calendar,
  ArrowRight,
  TrendingDown,
  Minus,
  ChevronRight,
} from "lucide-react";
import { formatScore, formatDate, getScoreBadgeColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DIM_LABELS: Record<string, string> = {
  pronunciation: "Phát âm & Chuẩn hóa 4 thanh điệu",
  fluency: "Nhịp điệu nói & Độ trôi chảy",
  vocabulary: "Vốn từ vựng & Độ phong phú",
  grammar: "Ngữ pháp & Cấu trúc liên từ",
  coherence: "Tính mạch lạc & Diễn ngôn logic",
  comprehension: "Khả năng lắng nghe & Hiểu đề",
  interaction: "Khả năng tương tác giao tiếp",
};

export default async function LearningProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [sessions, profile] = await Promise.all([
    (async () => {
      try {
        const list = await AssessmentService.getUserSessions(user.userId, user.email);
        return (list || []).filter((s: any) => s.status === "COMPLETED" && s.result);
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        const { FirebaseDb } = await import("@/lib/firebase-db");
        const fb =
          (await FirebaseDb.findUserById(user.userId)) ||
          (await FirebaseDb.findUserByEmail(user.email));
        if (fb) {
          return {
            targetLevel: fb.targetLevel || "HSK 3",
            name: fb.name,
            email: fb.email,
          };
        }
      } catch {
        // ignore
      }
      return assessmentStore.getProfile(user.userId);
    })(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tiến Độ Khẩu Ngữ Tiếng Trung
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Theo dõi mức độ cải thiện điểm số thực tế theo thời gian, sự chuẩn hóa thanh điệu và vốn từ vựng tích lũy qua các kỳ khảo thí.
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 text-center p-8 sm:p-14 rounded-3xl shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="h-8 w-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Chưa Có Dữ Liệu Khảo Thí Để Đánh Giá Tiến Độ
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-2 mb-6 leading-relaxed">
            Hệ thống không sử dụng dữ liệu giả định. Tiến độ học tập và biểu đồ thành thạo theo 7 chiều kích sẽ được tự động tính toán từ kết quả thi thực tế của bạn ngay sau khi hoàn thành bài khảo thí đầu tiên.
          </p>
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-6 rounded-2xl flex items-center gap-2 mx-auto shadow-sm">
              <Mic className="h-4 w-4" />
              <span>Bắt Đầu Bài Thi Đầu Tiên</span>
            </Button>
          </Link>
        </Card>
      ) : (
        (() => {
          const initialSession = sessions[0];
          const initialScore = initialSession.result?.overallScore || 0;
          const initialLevel =
            (initialSession.result as any)?.hskEstimate || (initialSession.template as any)?.targetLevel || "HSK 1";

          const latestSession = sessions[sessions.length - 1];
          const latestScore = latestSession.result?.overallScore || 0;
          const currentLevel =
            (latestSession.result as any)?.hskEstimate || profile?.targetLevel || "HSK 1";

          const highestScore = Math.max(
            ...sessions.map((s) => s.result?.overallScore || 0)
          );

          const growthDelta = Number((latestScore - initialScore).toFixed(1));

          const latestDimensions = (latestSession.result as any)?.scoreDimensions || [];
          const initialDimensions = (initialSession.result as any)?.scoreDimensions || [];

          return (
            <>
              {/* Progress Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardContent className="p-5 sm:p-6 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Điểm Chuẩn Khởi Đầu
                    </span>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                      {formatScore(initialScore)}{" "}
                      <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(initialSession.createdAt)} &bull; {initialLevel}</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardContent className="p-5 sm:p-6 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Điểm Cao Nhất Đạt Được
                    </span>
                    <div className="text-3xl font-black text-rose-600 dark:text-rose-500">
                      {formatScore(highestScore)}{" "}
                      <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                    <div className="text-xs font-semibold pt-1">
                      {growthDelta > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" /> +{growthDelta} Điểm Tăng Trưởng
                        </span>
                      ) : growthDelta < 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <TrendingDown className="h-3.5 w-3.5" /> {growthDelta} Điểm
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1">
                          <Minus className="h-3.5 w-3.5" /> {sessions.length === 1 ? "Bài thi khảo thí đầu tiên" : "Điểm số ổn định"}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs sm:col-span-2 md:col-span-1">
                  <CardContent className="p-5 sm:p-6 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Trình Độ Ước Tính Hiện Tại
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
                      {currentLevel}
                    </div>
                    <p className="text-xs text-slate-500 pt-1">
                      Chuẩn khẩu ngữ HSK 3.0 &bull; Tổng {sessions.length} bài thi đã làm
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Real Dimension Trajectory Breakdown */}
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <CardHeader className="p-5 sm:p-6 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-rose-600" />
                      <span>Mức Độ Thành Thạo Theo Chiều Kích (Thực Tế)</span>
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      Dữ liệu tính từ bài thi gần nhất ({formatDate(latestSession.createdAt)})
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 pt-0 space-y-5">
                  {latestDimensions.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Chưa có phân tích chiều kích điểm số cho bài thi này.
                    </p>
                  ) : (
                    latestDimensions.map((dim: any) => {
                      const max = dim.maxScore || 20;
                      const percent = Math.min(100, Math.max(0, Number(((dim.score / max) * 100).toFixed(1))));

                      let deltaDisplay: string | null = null;
                      let isPositive = true;

                      if (sessions.length > 1) {
                        const initDim = initialDimensions.find(
                          (d: any) => d.dimensionKey === dim.dimensionKey
                        );
                        if (initDim && initDim.maxScore) {
                          const initPercent = (initDim.score / initDim.maxScore) * 100;
                          const diff = Number((percent - initPercent).toFixed(1));
                          deltaDisplay = diff >= 0 ? `+${diff}%` : `${diff}%`;
                          isPositive = diff >= 0;
                        }
                      }

                      const displayName = DIM_LABELS[dim.dimensionKey] || dim.dimensionName;

                      return (
                        <div key={dim.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {displayName}
                              </span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-slate-500">
                                {dim.performanceLevel}
                              </Badge>
                            </div>
                            <span className="text-slate-500 shrink-0">
                              <span className="font-black text-slate-900 dark:text-white">
                                {dim.score}/{max}
                              </span>{" "}
                              ({percent}%)
                              {deltaDisplay && (
                                <>
                                  {" "}&bull;{" "}
                                  <span
                                    className={`font-bold ${
                                      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"
                                    }`}
                                  >
                                    {deltaDisplay}
                                  </span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-rose-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              {/* Historical Sessions Trajectory (Responsive: Mobile Cards & Desktop Table) */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-rose-600" />
                  <span>Lịch Sử Tiến Trình Khảo Thí</span>
                </h2>

                {/* Mobile View (< 640px) */}
                <div className="block sm:hidden space-y-3">
                  {sessions.map((s, idx) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(s.createdAt)}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {(s as any).template?.title || "Bài thi khảo thí"}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-rose-600">
                            {formatScore(s.result?.overallScore || 0)}/100
                          </span>
                          <span className="text-[10px] block font-bold text-slate-500">
                            {(s.result as any)?.hskEstimate || (s as any).template?.targetLevel || "HSK"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Link
                          href={`/dashboard/reports/${s.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          <span>Xem chi tiết báo cáo</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View (>= 640px) */}
                <div className="hidden sm:block rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-5">Lượt</th>
                        <th className="py-3.5 px-5">Bài Thi Khảo Thí</th>
                        <th className="py-3.5 px-5">Thời Gian</th>
                        <th className="py-3.5 px-5">Điểm Số</th>
                        <th className="py-3.5 px-5">Đánh Giá HSK</th>
                        <th className="py-3.5 px-5 text-right">Chi Tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {sessions.map((s, idx) => (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-400">
                            #{idx + 1}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                            {(s as any).template?.title || "Bài thi khảo thí"}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500">
                            {formatDate(s.createdAt)}
                          </td>
                          <td className="py-3.5 px-5 font-black text-rose-600 dark:text-rose-400 text-sm">
                            {formatScore(s.result?.overallScore || 0)}/100
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                            {(s.result as any)?.hskEstimate || (s as any).template?.targetLevel || "HSK"}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Link
                              href={`/dashboard/reports/${s.id}`}
                              className="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                            >
                              <span>Xem báo cáo</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}
