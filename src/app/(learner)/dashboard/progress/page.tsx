import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, BarChart2, CheckCircle2 } from "lucide-react";
import { formatScore, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearningProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const sessions = await prisma.assessmentSession.findMany({
    where: {
      userId: user.userId,
      status: "COMPLETED",
    },
    include: {
      result: {
        include: {
          scoreDimensions: true,
        },
      },
      template: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tiến Độ Khẩu Ngữ Tiếng Trung
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Theo dõi mức độ cải thiện điểm số theo thời gian, sự chuẩn hóa thanh điệu và vốn từ vựng tích lũy qua các kỳ khảo thí.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Điểm Chuẩn Khởi Đầu
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              72.0 <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500">Nền tảng HSK 3 (CEFR B1)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Điểm Cao Nhất Hiện Tại
            </span>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-500">
              84.5 <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +12.5 Điểm Tăng Trưởng
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trình Độ Hiện Tại
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              HSK 4 Trung Cấp
            </div>
            <p className="text-xs text-slate-500">Sẵn sàng cho khẩu ngữ thương mại HSK 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Dimension Trajectory Breakdown */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-rose-600" />
            <span>Mức Độ Thành Thạo Theo Chiều Kích</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          {[
            { name: "Phát âm & Chuẩn hóa 4 thanh điệu", score: 87.5, level: "Thành thạo", delta: "+8%" },
            { name: "Nhịp điệu nói & Độ trôi chảy", score: 85.0, level: "Thành thạo", delta: "+15%" },
            { name: "Vốn từ vựng & Độ phong phú", score: 83.3, level: "Thành thạo", delta: "+10%" },
            { name: "Ngữ pháp & Cấu trúc liên từ phức hợp", score: 86.6, level: "Thành thạo", delta: "+12%" },
            { name: "Tính mạch lạc & Diễn ngôn logic", score: 85.0, level: "Xuất sắc", delta: "+5%" },
            { name: "Khả năng tương tác giao tiếp", score: 80.0, level: "Thành thạo", delta: "+18%" },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                <span className="text-slate-500">
                  {item.score}% &bull;{" "}
                  <span className="text-emerald-600 font-bold">{item.delta}</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
