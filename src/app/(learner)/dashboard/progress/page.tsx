import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
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
} from "lucide-react";
import { formatScore, formatDate, getScoreBadgeColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DIM_LABELS: Record<string, string> = {
  pronunciation: "Phát âm & Chuẩn hóa 4 thanh điệu",
  fluency: "Nhịp điệu nói & Độ trôi chảy",
  vocabulary: "Vốn từ vựng & Độ phong phú",
  grammar: "Ngữ pháp & Cấu trúc liên từ phức hợp",
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
        const { default: prisma } = await import("@/lib/db/prisma");
        return await prisma.assessmentSession.findMany({
          where: {
            userId: user.userId,
            status: "COMPLETED",
            result: { isNot: null },
          },
          include: {
            result: {
              include: {
                scoreDimensions: {
                  orderBy: { weight: "desc" },
                },
              },
            },
            template: true,
          },
          orderBy: { createdAt: "asc" },
        });
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        const { default: prisma } = await import("@/lib/db/prisma");
        return await prisma.userProfile.findUnique({
          where: { userId: user.userId },
        });
      } catch {
        return null;
      }
    })(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tiến Độ Khẩu Ngữ Tiếng Trung
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Theo dõi mức độ cải thiện điểm số thực tế theo thời gian, sự chuẩn hóa thanh điệu và vốn từ vựng tích lũy qua các kỳ khảo thí.
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 text-center p-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Chưa Có Dữ Liệu Khảo Thí Để Đánh Giá Tiến Độ
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2 mb-6 leading-relaxed">
            Hệ thống không sử dụng dữ liệu giả định. Tiến độ học tập và biểu đồ thành thạo theo 7 chiều kích sẽ được tự động tính toán từ kết quả thi thực tế của bạn ngay sau khi hoàn thành bài khảo thí đầu tiên.
          </p>
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 mx-auto shadow-sm">
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
            initialSession.result?.hskEstimate || initialSession.template.targetLevel || "HSK 1";

          const latestSession = sessions[sessions.length - 1];
          const latestScore = latestSession.result?.overallScore || 0;
          const currentLevel =
            latestSession.result?.hskEstimate || profile?.targetLevel || "HSK 1";

          const highestScore = Math.max(
            ...sessions.map((s) => s.result?.overallScore || 0)
          );

          const growthDelta = Number((latestScore - initialScore).toFixed(1));

          const latestDimensions = latestSession.result?.scoreDimensions || [];
          const initialDimensions = initialSession.result?.scoreDimensions || [];

          return (
            <>
              {/* Progress Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardContent className="p-6 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Điểm Chuẩn Khởi Đầu
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {formatScore(initialScore)}{" "}
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(initialSession.createdAt)} &bull; {initialLevel}</span>
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardContent className="p-6 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Điểm Cao Nhất Đạt Được
                    </span>
                    <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-500">
                      {formatScore(highestScore)}{" "}
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                    <p className="text-xs font-semibold flex items-center gap-1">
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
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                  <CardContent className="p-6 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Trình Độ Ước Tính Hiện Tại
                    </span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                      {currentLevel}
                    </div>
                    <p className="text-xs text-slate-500">
                      Chuẩn khẩu ngữ HSK 3.0 &bull; Tổng {sessions.length} bài thi đã làm
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Real Dimension Trajectory Breakdown */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-rose-600" />
                      <span>Mức Độ Thành Thạo Theo Chiều Kích (Thực Tế)</span>
                    </CardTitle>
                    <span className="text-xs text-slate-500">
                      Dữ liệu tính từ bài thi gần nhất ({formatDate(latestSession.createdAt)})
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  {latestDimensions.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Chưa có phân tích chiều kích điểm số cho bài thi này.
                    </p>
                  ) : (
                    latestDimensions.map((dim) => {
                      const max = dim.maxScore || 20;
                      const percent = Math.min(100, Math.max(0, Number(((dim.score / max) * 100).toFixed(1))));

                      // Compare with initial session
                      let deltaDisplay: string | null = null;
                      let isPositive = true;

                      if (sessions.length > 1) {
                        const initDim = initialDimensions.find(
                          (d) => d.dimensionKey === dim.dimensionKey
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
                        <div key={dim.id} className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {displayName}
                              </span>
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-slate-500">
                                {dim.performanceLevel}
                              </Badge>
                            </div>
                            <span className="text-slate-500">
                              <span className="font-bold text-slate-900 dark:text-white">
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
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
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

              {/* Historical Sessions Trajectory Table */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-rose-600" />
                  <span>Lịch Sử Tiến Trình Khảo Thí</span>
                </h2>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Lượt</th>
                          <th className="py-3 px-4">Bài Thi Khảo Thí</th>
                          <th className="py-3 px-4">Thời Gian</th>
                          <th className="py-3 px-4">Điểm Số</th>
                          <th className="py-3 px-4">Đánh Giá HSK</th>
                          <th className="py-3 px-4 text-right">Chi Tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {sessions.map((s, idx) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-slate-400">
                              #{idx + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              {s.template.title}
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {formatDate(s.createdAt)}
                            </td>
                            <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">
                              {formatScore(s.result?.overallScore || 0)}/100
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {s.result?.hskEstimate || s.template.targetLevel}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link
                                href={`/dashboard/reports/${s.id}`}
                                className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
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
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}
