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
  Lightbulb,
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
  const grammarRecs = result.recommendations.filter((r: any) => r.category === "GRAMMAR");
  const vocabRecs = result.recommendations.filter((r: any) => r.category === "VOCABULARY");
  const pronRecs = result.recommendations.filter((r: any) => r.category === "PRONUNCIATION");

  const strengths = (result.strengthsJson as string[]) || [];
  const weaknesses = (result.weaknessesJson as string[]) || [];
  const priorityAreas = (result.priorityAreasJson as string[]) || [];
  const improvementPlan = (result.improvementPlanJson as any[]) || [];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-20 print:p-0 print:space-y-4 animate-in fade-in duration-200">
      {/* 1. BACK & EXPORT BAR */}
      <div className="flex items-center justify-between print:hidden gap-2">
        <Link href="/dashboard/reports">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh sách báo cáo</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* 2. REPORT HEADER CARD (Hero Overview) */}
      <Card className="border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden rounded-3xl bg-gradient-to-br from-white via-rose-50/20 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <CardContent className="p-5 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="cinnabar" className="text-xs font-bold">
                  {result.hskEstimate}
                </Badge>
                {result.cefrEstimate && (
                  <Badge variant="outline" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    CEFR {result.cefrEstimate}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Tiêu chuẩn HSK 3.0
                </Badge>
                {result.isAcousticAided && (
                  <Badge variant="success" className="text-[10px]">
                    Đã xác thực âm học
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Báo Cáo Chẩn Đoán Khẩu Ngữ Tiếng Trung
              </h1>

              <p className="text-xs text-slate-500">
                Thí sinh:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {session.user.name}
                </strong>{" "}
                &bull; Bài thi:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  {session.template.title}
                </strong>{" "}
                &bull; Ngày thi: {formatDate(session.completedAt || session.createdAt)}
              </p>
            </div>

            {/* Score Callout */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-4 sm:p-0 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 sm:bg-transparent border sm:border-0 border-rose-100 dark:border-rose-900/40">
              <div className="text-left sm:text-right">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
                  Tổng Điểm Khẩu Ngữ
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-rose-600 dark:text-rose-500">
                    {formatScore(result.overallScore)}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Độ tin cậy: {(result.confidenceLevel * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Performance Summary Paragraph */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 border border-slate-100 dark:border-slate-800 space-y-2">
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

      {/* 3. 7-DIMENSION SCORING BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-rose-600" />
            <span>7 Chiều Kích Đánh Giá Chuẩn Hóa</span>
          </h2>
          <span className="text-xs text-slate-500">Thang điểm tâm trắc học</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.scoreDimensions.map((dim: any) => {
            const percent = Math.round((dim.score / dim.maxScore) * 100);
            const quotes = (dim.evidenceQuotesJson as string[]) || [];

            return (
              <Card key={dim.id} className="border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {localizeDimensionName(dim.dimensionName)}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Trọng số: {(dim.weight * 100).toFixed(0)}% &bull; {formatPerformanceLevel(dim.performanceLevel)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-slate-900 dark:text-white">
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
                        Dẫn chứng thoại:
                      </span>
                      <p className="text-[11px] italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        &quot;{quotes[0]}&quot;
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. STRENGTHS & WEAKNESSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="rounded-3xl border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-950 dark:bg-emerald-950/10 shadow-xs">
          <CardContent className="p-5 sm:p-6 space-y-3">
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

        <Card className="rounded-3xl border-rose-200/80 bg-rose-50/20 dark:border-rose-950 dark:bg-rose-950/10 shadow-xs">
          <CardContent className="p-5 sm:p-6 space-y-3">
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

      {/* 5. GRAMMAR ANALYSIS (Responsive: Cards for Mobile, Table for Desktop) */}
      {grammarRecs.length > 0 && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <BookOpen className="h-4 w-4 text-rose-600" />
              <span>Phân Tích Ngữ Pháp & Cấu Trúc Câu ({grammarRecs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
            {/* Mobile View: Clean Card Items (< 640px) */}
            <div className="block sm:hidden space-y-3">
              {grammarRecs.map((g: any) => (
                <div
                  key={g.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-4 space-y-2.5 text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Câu gốc của bạn:
                    </span>
                    <p className="font-medium text-rose-600 dark:text-rose-400 line-through decoration-rose-300">
                      {g.originalPhrase}
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Cách nói chuẩn xác:
                    </span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                      {g.correctedPhrase}
                    </p>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {g.explanation}
                  </p>

                  {g.exampleSentence && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px] italic text-slate-500">
                      Ví dụ: {g.exampleSentence}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Câu nói của bạn</th>
                    <th className="py-3 px-4">Cách diễn đạt chuẩn</th>
                    <th className="py-3 px-4">Quy tắc ngữ pháp</th>
                    <th className="py-3 px-4">Ví dụ áp dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {grammarRecs.map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-medium line-through decoration-rose-300">
                        {g.originalPhrase}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-bold">
                        {g.correctedPhrase}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {g.explanation}
                      </td>
                      <td className="py-3 px-4 italic text-slate-500">
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

      {/* 6. VOCABULARY ENHANCEMENT (Responsive: Cards for Mobile, Table for Desktop) */}
      {vocabRecs.length > 0 && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span>Nâng Cấp Từ Vựng & Sắc Thái Trang Trọng ({vocabRecs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
            {/* Mobile View: Clean Card Items (< 640px) */}
            <div className="block sm:hidden space-y-3">
              {vocabRecs.map((v: any) => (
                <div
                  key={v.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-4 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Từ thông thường:</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{v.originalPhrase}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-rose-600 uppercase">Từ nâng cao:</span>
                      <p className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">{v.correctedPhrase}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    {v.explanation}
                  </p>

                  {v.exampleSentence && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px] italic text-slate-500">
                      Ngữ cảnh: {v.exampleSentence}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Từ ngữ khẩu ngữ</th>
                    <th className="py-3 px-4">Từ vựng nâng cao / Trang trọng</th>
                    <th className="py-3 px-4">Sắc thái ý nghĩa</th>
                    <th className="py-3 px-4">Ví dụ ngữ cảnh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vocabRecs.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {v.originalPhrase}
                      </td>
                      <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-bold">
                        {v.correctedPhrase}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {v.explanation}
                      </td>
                      <td className="py-3 px-4 italic text-slate-500">
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

      {/* 7. PRONUNCIATION & TONE DIAGNOSIS (Responsive: Cards for Mobile, Table for Desktop) */}
      {pronRecs.length > 0 && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Volume2 className="h-4 w-4 text-rose-600" />
              <span>Chẩn Đoán Phát Âm & Biến Điệu Thanh ({pronRecs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0 space-y-3">
            {/* Mobile View: Clean Card Items (< 640px) */}
            <div className="block sm:hidden space-y-3">
              {pronRecs.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {p.originalPhrase}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      {p.correctedPhrase}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {p.explanation}
                  </p>

                  {p.exampleSentence && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-semibold text-rose-600">
                      Từ luyện tập: {p.exampleSentence}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View: Full Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Điểm ngữ âm trọng tâm</th>
                    <th className="py-3 px-4">Hiện tượng ghi nhận</th>
                    <th className="py-3 px-4">Gợi ý luyện tập cải thiện</th>
                    <th className="py-3 px-4">Từ luyện tập tiêu biểu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pronRecs.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/40">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">
                        {p.originalPhrase}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {p.explanation}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-medium">
                        {p.correctedPhrase}
                      </td>
                      <td className="py-3 px-4 italic font-medium text-rose-600 dark:text-rose-400">
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

      {/* 8. PERSONALIZED WEEKLY LEARNING ROADMAP */}
      {improvementPlan.length > 0 && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Calendar className="h-4 w-4 text-rose-600" />
              <span>Lộ Trình Học Tập 4 Tuần Cá Nhân Hóa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {improvementPlan.map((plan: any, i: number) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[10px] bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/40 inline-block">
                      Tuần {plan.week}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight text-sm">
                      {plan.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{plan.focus}</p>
                  </div>

                  <ul className="space-y-1.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
                    {plan.activities?.map((act: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">&bull;</span>
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

      {/* 9. COMPLETE CONVERSATION TRANSCRIPT VIEWER */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="h-4 w-4 text-rose-600" />
            <span>Toàn Bộ Biên Bản Hội Thoại ({session.turns.length} lượt thoại)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-0 space-y-4">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {session.turns.map((turn: any) => {
              const isExaminer = turn.speaker === "EXAMINER";

              return (
                <div key={turn.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-bold ${
                        isExaminer
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {isExaminer ? "考官 Giám khảo Lý" : "考生 Thí sinh (Bạn)"} &bull; Chặng {turn.stage}
                    </span>
                    {turn.audioUrl && (
                      <audio controls src={turn.audioUrl} className="h-6 w-36" />
                    )}
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-sm">
                    {turn.textContent}
                  </p>
                  {turn.pinyinContent && (
                    <p className="text-xs text-rose-600/80 dark:text-rose-400/80 font-sans">
                      {turn.pinyinContent}
                    </p>
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
