import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Award,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { formatDate, formatScore, getScoreBadgeColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [sessions, profile, subscription] = await Promise.all([
    prisma.assessmentSession.findMany({
      where: { userId: user.userId },
      include: {
        template: true,
        result: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.userProfile.findUnique({
      where: { userId: user.userId },
    }),
    prisma.subscription.findFirst({
      where: { userId: user.userId, status: "ACTIVE" },
      include: { plan: true },
    }),
  ]);

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED" && s.result);
  const latestSession = completedSessions[0];

  const userTargetLevel = profile?.targetLevel || "HSK 1";

  const LEVEL_RECOMMENDATIONS: Record<string, { title: string; desc: string; duration: string }> = {
    "HSK 1": {
      title: "HSK 1: Làm Quen Ngữ Âm & Giao Tiếp Cơ Bản",
      desc: "Chào hỏi, tự giới thiệu, hỏi thăm sức khỏe và luyện phát âm chuẩn xác 4 thanh điệu cùng Giám khảo AI.",
      duration: "10 Phút",
    },
    "HSK 2": {
      title: "HSK 2: Sinh Hoạt Hàng Ngày & Mua Sắm",
      desc: "Giao tiếp trong các tình huống mua sắm, ẩm thực, hỏi đường và thời tiết thường ngày với các mẫu câu thông dụng.",
      duration: "10 Phút",
    },
    "HSK 3": {
      title: "HSK 3: Thảo Luận Đời Sống & Du Lịch",
      desc: "Trao đổi về học tập, du lịch, thói quen và diễn đạt suy nghĩ với các cấu trúc liên từ kết nối câu cơ bản.",
      duration: "12 Phút",
    },
    "HSK 4": {
      title: "HSK 4: Lập Luận Khẩu Ngữ & Văn Hóa Trung Hoa",
      desc: "Nâng cấp từ hội thoại sinh hoạt sang thuyết trình quan điểm. Thảo luận về công nghệ, trải nghiệm văn hóa và luyện biến điệu thanh 3 cùng Giám khảo AI.",
      duration: "12 Phút",
    },
    "HSK 5": {
      title: "HSK 5: Diễn Đạt Chuyên Sâu & Đàm Phán Thương Mại",
      desc: "Thảo luận về các chủ đề kinh tế - xã hội chuyên sâu, sử dụng thành ngữ phong phú và lập luận đa chiều trong môi trường làm việc.",
      duration: "15 Phút",
    },
    "HSK 6": {
      title: "HSK 6: Thành Thạo Khẩu Ngữ & Biện Luận Phức Hợp",
      desc: "Khả năng diễn ngôn lưu loát, tự nhiên như người bản xứ, phân tích văn hóa sâu sắc và phản biện luận điểm phức tạp.",
      duration: "15 Phút",
    },
  };

  const matchedLevelKey = Object.keys(LEVEL_RECOMMENDATIONS).find((k) => userTargetLevel.includes(k)) || "HSK 1";
  const recommendedAssessment = LEVEL_RECOMMENDATIONS[matchedLevelKey];

  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.result?.overallScore || 0), 0) /
        completedSessions.length
      : 84.5;

  return (
    <div className="space-y-8">
      {/* Welcome & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Chào mừng trở lại, {user.name}!
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Mục tiêu: <span className="font-semibold text-rose-600 dark:text-rose-400">{userTargetLevel}</span> &bull; Số dư:{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">200 Credits</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-sm">
              <Mic className="h-4 w-4" />
              <span>Bắt Đầu Khảo Thí</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Điểm Khẩu Ngữ Gần Nhất</span>
              <Award className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {latestSession?.result ? formatScore(latestSession.result.overallScore) : "84.5"}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{latestSession?.result?.hskEstimate || `Mục tiêu ${userTargetLevel}`}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Điểm Trung Bình</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatScore(avgScore)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Tổng hợp qua {completedSessions.length || 1} bài kiểm tra hoàn thành
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Bài Thi Đã Xong</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {completedSessions.length || 1}
              </span>
              <span className="text-xs text-slate-400">lượt thi</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Phỏng vấn khẩu ngữ 5 giai đoạn
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span className="font-bold text-amber-800 dark:text-amber-300">Credit Khả Dụng</span>
              <Coins className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-900 dark:text-amber-200">
                200
              </span>
              <span className="text-xs text-amber-700/80 dark:text-amber-400">/ 200 Credits</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Khả dụng cho các lượt khảo thí</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Next Assessment & Quick Action */}
      <Card className="border-slate-200 bg-gradient-to-r from-rose-50/50 via-white to-white dark:border-slate-800 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="cinnabar" className="text-xs">
              Đề xuất phù hợp với trình độ {userTargetLevel}
            </Badge>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {recommendedAssessment.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {recommendedAssessment.desc}
            </p>
          </div>
          <Link href="/dashboard/assessments" className="shrink-0">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Bắt Đầu Khảo Thí {recommendedAssessment.duration}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Assessment Reports Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-rose-600" />
            <span>Báo Cáo Đánh Giá Gần Đây</span>
          </h2>
          <Link href="/dashboard/reports" className="text-xs font-semibold text-rose-600 hover:underline">
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Tên Bài Thi Khẩu Ngữ</th>
                  <th className="py-3.5 px-4">Ngày Thi</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Tổng Điểm</th>
                  <th className="py-3.5 px-4">Trình Độ Ước Tính</th>
                  <th className="py-3.5 px-4 text-right">Chi Tiết Báo Cáo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Chưa có bài thi nào. Bấm &quot;Bắt Đầu Khảo Thí&quot; để thi bài đầu tiên!
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {s.template.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            s.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : s.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {s.status === "COMPLETED" ? "Đã chấm xong" : s.status === "IN_PROGRESS" ? "Đang thi" : "Đang xử lý"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {s.result ? `${formatScore(s.result.overallScore)} / 100` : "Đang tính điểm"}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.result ? (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {s.result.hskEstimate}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {s.status === "COMPLETED" ? (
                          <Link href={`/dashboard/reports/${s.id}`}>
                            <Button variant="outline" size="sm" className="text-xs h-7">
                              Xem Chẩn Đoán
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/dashboard/assessments/${s.id}`}>
                            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-7">
                              Tiếp Tục Thi
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
