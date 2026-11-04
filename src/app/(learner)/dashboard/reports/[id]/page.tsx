import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { AssessmentService } from "@/services/assessment-service";
import { ScoringWorker } from "@/lib/queue/scoring-worker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Volume2,
  Calendar,
  Clock,
  Printer,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  FileText,
  HelpCircle,
} from "lucide-react";
import { formatDate, formatScore, getScoreBadgeColor } from "@/lib/utils";

import { PrintButton } from "@/components/reports/print-button";

function formatPerformanceLevel(level: string): string {
  switch (level) {
    case "Mastery":
      return "Thành thạo (Mastery)";
    case "Proficient":
      return "Đạt chuẩn (Proficient)";
    case "Developing":
      return "Cần cải thiện (Developing)";
    case "Elementary":
      return "Cơ bản (Elementary)";
    default:
      return level;
  }
}

function localizeDimensionName(name: string): string {
  const map: Record<string, string> = {
    "Pronunciation & Tones (发音与声调)": "Phát âm & Thanh điệu (发音与声调)",
    "Pronunciation & Tones": "Phát âm & Thanh điệu (发音与声调)",
    "Fluency & Speech Rhythm (流利度与语速连贯)": "Độ lưu loát & Nhịp điệu nói (流利度与语速连贯)",
    "Fluency & Speech Rhythm": "Độ lưu loát & Nhịp điệu nói (流利度与语速连贯)",
    "Vocabulary Range (词汇广度与得体度)": "Vốn từ vựng & Tính chuẩn xác (词汇广度与得体度)",
    "Vocabulary Range": "Vốn từ vựng & Tính chuẩn xác (词汇广度与得体度)",
    "Grammar & Syntax (语法结构与准确度)": "Cấu trúc ngữ pháp & Độ chuẩn xác (语法结构与准确度)",
    "Grammar & Syntax": "Cấu trúc ngữ pháp & Độ chuẩn xác (语法结构与准确度)",
    "Coherence & Discourse (篇章连贯与逻辑结构)": "Tính liên kết & Cấu trúc ngữ đoạn (篇章连贯与逻辑结构)",
    "Coherence & Discourse": "Tính liên kết & Cấu trúc ngữ đoạn (篇章连贯与逻辑结构)",
    "Listening Comprehension (听力理解与应答切题)": "Khả năng nghe hiểu & Phản xạ (听力理解与应答切题)",
    "Listening Comprehension": "Khả năng nghe hiểu & Phản xạ (听力理解与应答切题)",
    "Interactive Sustained Dialogue (互动表达与深层展开)": "Khả năng tương tác & Mở rộng chiều sâu (互动表达与深层展开)",
    "Interactive Sustained Dialogue": "Khả năng tương tác & Mở rộng chiều sâu (互动表达与深层展开)",
  };
  return map[name] || name;
}

export const dynamic = "force-dynamic";

export default async function AssessmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  let session: any = null;
  try {
    session = await AssessmentService.getSessionWithReport(id, user?.userId || "");
  } catch {
    session = null;
  }

  // Auto-recovery: If session is in PROCESSING status and has no result yet, guarantee scoring completion
  if (session && session.status === "PROCESSING" && !session.result) {
    try {
      await ScoringWorker.ensureSessionScored(id);
      session = await AssessmentService.getSessionWithReport(id, user?.userId || "");
    } catch (err) {
      console.error("Auto-recovery scoring error:", err);
    }
  }

  if (!session || !session.result) {
    notFound();
  }

  const result = session.result;
  const scoreBadge = getScoreBadgeColor(result.overallScore);

  const grammarRecs = result.recommendations.filter((r: any) => r.category === "GRAMMAR");
  const vocabRecs = result.recommendations.filter((r: any) => r.category === "VOCABULARY");
  const pronRecs = result.recommendations.filter((r: any) => r.category === "PRONUNCIATION");

  const strengths = (result.strengthsJson as string[]) || [];
  const weaknesses = (result.weaknessesJson as string[]) || [];
  const priorityAreas = (result.priorityAreasJson as string[]) || [];
  const improvementPlan = (result.improvementPlanJson as any[]) || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 print:p-0 print:space-y-4">
      {/* Back & Export Bar */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="sm" className="text-xs text-slate-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại danh sách báo cáo
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Report Header Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="cinnabar" className="text-xs">
                  {result.hskEstimate}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Tiêu chuẩn HSK 3.0
                </Badge>
                {result.isAcousticAided && (
                  <Badge variant="success" className="text-[10px]">
                    Đã xác thực âm học
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
                Báo Cáo Chẩn Đoán Khẩu Ngữ Tiếng Trung
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Thí sinh: <span className="font-semibold text-slate-800 dark:text-slate-200">{session.user.name}</span> &bull; Bài thi:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{session.template.title}</span>
              </p>
            </div>

            {/* Score Callout */}
            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              <div className="text-left sm:text-right">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Điểm Tổng Quan
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-rose-600 dark:text-rose-500">
                    {formatScore(result.overallScore)}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Độ tin cậy chẩn đoán: {(result.confidenceLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Performance Summary Paragraph */}
          <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span>Tóm Tắt Chẩn Đoán Ngôn Ngữ Học</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {result.performanceSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 7-Dimension Scoring Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-rose-600" />
            <span>7 Chiều Kích Đánh Giá Chuẩn Hóa</span>
          </h2>
          <span className="text-xs text-slate-500">Thang điểm khẩu ngữ trọng số tâm trắc học</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.scoreDimensions.map((dim: any) => {
            const percent = Math.round((dim.score / dim.maxScore) * 100);
            const quotes = (dim.evidenceQuotesJson as string[]) || [];
            const suggestions = (dim.suggestionsJson as string[]) || [];

            return (
              <Card key={dim.id} className="border-slate-200 dark:border-slate-800">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {localizeDimensionName(dim.dimensionName)}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Trọng số: {(dim.weight * 100).toFixed(0)}% &bull; Cấp độ: {formatPerformanceLevel(dim.performanceLevel)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {dim.score}
                      </span>
                      <span className="text-xs text-slate-400">/{dim.maxScore}</span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent >= 80 ? "bg-emerald-500" : percent >= 65 ? "bg-blue-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {dim.rationale}
                  </p>

                  {/* Evidence Quotes */}
                  {quotes.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        Dẫn chứng từ biên bản thoại:
                      </span>
                      <p className="text-[11px] italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        {quotes[0]}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/10">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Điểm Mạnh Nổi Bật</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-rose-200/80 bg-rose-50/20 dark:border-rose-950 dark:bg-rose-950/10">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Điểm Yếu Cần Cải Thiện & Trọng Tâm</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Grammar Analysis Section */}
      {grammarRecs.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-rose-600" />
              <span>Phân Tích Ngữ Pháp & Cấu Trúc Câu</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Câu nói gốc của thí sinh</th>
                    <th className="py-2.5 px-3">Cách diễn đạt chuẩn xác</th>
                    <th className="py-2.5 px-3">Quy tắc ngữ pháp & giải thích</th>
                    <th className="py-2.5 px-3">Ví dụ áp dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {grammarRecs.map((g: any) => (
                    <tr key={g.id}>
                      <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-medium line-through decoration-rose-300">
                        {g.originalPhrase}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 dark:text-emerald-300 font-semibold">
                        {g.correctedPhrase}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {g.explanation}
                      </td>
                      <td className="py-3 px-3 italic text-slate-500">
                        {g.exampleSentence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Enhancement Section */}
      {vocabRecs.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span>Nâng Cấp Từ Vựng & Sắc Thái Trang Trọng</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Từ ngữ khẩu ngữ</th>
                    <th className="py-2.5 px-3">Từ vựng nâng cao / Trang trọng</th>
                    <th className="py-2.5 px-3">Sắc thái ý nghĩa & ngữ cảnh</th>
                    <th className="py-2.5 px-3">Ví dụ ngữ cảnh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vocabRecs.map((v: any) => (
                    <tr key={v.id}>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {v.originalPhrase}
                      </td>
                      <td className="py-3 px-3 text-rose-600 dark:text-rose-400 font-bold">
                        {v.correctedPhrase}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {v.explanation}
                      </td>
                      <td className="py-3 px-3 italic text-slate-500">
                        {v.exampleSentence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pronunciation & Tone Diagnosis Section */}
      {pronRecs.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-rose-600" />
              <span>Chẩn Đoán Phát Âm & Biến Điệu Thanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Điểm ngữ âm trọng tâm</th>
                    <th className="py-2.5 px-3">Hiện tượng ghi nhận</th>
                    <th className="py-2.5 px-3">Gợi ý luyện tập cải thiện</th>
                    <th className="py-2.5 px-3">Từ luyện tập tiêu biểu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pronRecs.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-semibold">
                        {p.originalPhrase}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {p.explanation}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 dark:text-emerald-300 font-medium">
                        {p.correctedPhrase}
                      </td>
                      <td className="py-3 px-3 italic font-medium text-rose-600 dark:text-rose-400">
                        {p.exampleSentence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Weekly Learning Roadmap */}
      {improvementPlan.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-600" />
              <span>Lộ Trình Học Tập 4 Tuần Cá Nhân Hóa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {improvementPlan.map((plan: any, i: number) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px]">
                    Tuần {plan.week}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                    {plan.title}
                  </h4>
                  <p className="text-slate-500 text-[11px]">{plan.focus}</p>
                  <ul className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                    {plan.activities?.map((act: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500">&bull;</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Conversation Transcript Viewer */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-rose-600" />
            <span>Toàn Bộ Biên Bản Hội Thoại & Bản Ghi Âm</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {session.turns.map((turn: any) => {
              const isExaminer = turn.speaker === "EXAMINER";

              return (
                <div key={turn.id} className="py-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-bold ${
                        isExaminer ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {isExaminer ? "考官 Giám khảo Lý" : "考生 Thí sinh"} &bull; Giai đoạn {turn.stage}
                    </span>
                    {turn.audioUrl && (
                      <audio controls src={turn.audioUrl} className="h-6 w-36" />
                    )}
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                    {turn.textContent}
                  </p>
                  {turn.pinyinContent && (
                    <p className="text-[10px] text-slate-400 italic">{turn.pinyinContent}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
