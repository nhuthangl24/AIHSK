"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Sparkles,
  Target,
  Clock,
  Compass,
  MessageCircle,
  Flame,
  BookOpen,
} from "lucide-react";
import { formatScore, formatDate, getScoreBadgeColor } from "@/lib/utils";

const DIM_LABELS: Record<string, { title: string; desc: string; weight: string }> = {
  pronunciation: {
    title: "Phát âm & Chuẩn hóa 4 thanh điệu",
    desc: "Độ chính xác nguyên âm, phụ âm và đường nét cao độ F0 thanh điệu.",
    weight: "20%",
  },
  fluency: {
    title: "Nhịp điệu nói & Độ trôi chảy",
    desc: "Tốc độ nói (âm tiết/giây), khoảng dừng tự nhiên và giảm thiểu ngập ngừng.",
    weight: "20%",
  },
  vocabulary: {
    title: "Vốn từ vựng & Độ phong phú",
    desc: "Sử dụng từ vựng chuẩn HSK, từ nối và khả năng diễn đạt đa dạng.",
    weight: "15%",
  },
  grammar: {
    title: "Ngữ pháp & Cấu trúc liên từ",
    desc: "Trật tự từ ngữ pháp, trợ từ cấu trúc và các cặp liên từ phức hợp.",
    weight: "15%",
  },
  coherence: {
    title: "Tính mạch lạc & Diễn ngôn logic",
    desc: "Luận điểm rõ ràng, liên kết ý mạch lạc từ mở bài đến kết luận.",
    weight: "10%",
  },
  comprehension: {
    title: "Khả năng lắng nghe & Hiểu đề",
    desc: "Bắt đúng trọng tâm câu hỏi của Giám khảo AI và trả lời trực diện.",
    weight: "10%",
  },
  interaction: {
    title: "Khả năng tương tác giao tiếp",
    desc: "Phản xạ giao tiếp tự nhiên, đối đáp linh hoạt trong tình huống thực tế.",
    weight: "10%",
  },
};

const HSK_ROADMAP_MILESTONES: Record<
  string,
  {
    level: string;
    hskkEquiv: string;
    vocabTarget: string;
    headline: string;
    milestones: string[];
  }
> = {
  "HSK 1": {
    level: "HSK 1",
    hskkEquiv: "Sơ cấp (Khởi động)",
    vocabTarget: "150 từ vựng",
    headline: "Xây dựng nền móng phát âm chuẩn và phản xạ chào hỏi căn bản",
    milestones: [
      "Chuẩn hóa 21 thanh mẫu, 36 vận mẫu và 4 thanh điệu tiếng Quan Thoại.",
      "Tự giới thiệu bản thân, quốc tịch, tuổi tác và nghề nghiệp cơ bản.",
      "Hỏi đáp các nhu cầu sinh hoạt tối giản (chào hỏi, cảm ơn, xin lỗi).",
      "Nắm vững các câu đơn cấu trúc S + V + O cơ bản.",
    ],
  },
  "HSK 2": {
    level: "HSK 2",
    hskkEquiv: "HSKK Sơ cấp",
    vocabTarget: "300 từ vựng",
    headline: "Giao tiếp sinh hoạt thường nhật và tự tin trong các tình huống mua sắm",
    milestones: [
      "Hỏi giá cả, chỉ đường, hỏi giờ và thời tiết trôi chảy.",
      "Sử dụng thành thạo trợ từ ngữ khí: 了, 吧, 呢, 吗.",
      "Mô tả sở thích, kế hoạch cuối tuần và sinh hoạt gia đình ngắn gọn.",
      "Khắc phục lỗi phát âm biến điệu thanh 3 (ví dụ: 你好, 可以).",
    ],
  },
  "HSK 3": {
    level: "HSK 3",
    hskkEquiv: "HSKK Trung cấp (Mục tiêu chuẩn)",
    vocabTarget: "600 từ vựng",
    headline: "Thuyết trình chủ đề quen thuộc và tư duy phản biện khẩu ngữ logic",
    milestones: [
      "Sử dụng linh hoạt các liên từ phức hợp: 因为...所以..., 虽然...但是..., 不仅...而且...",
      "Thuyết trình liên tục 1 - 2 phút về công việc, du lịch, thói quen học tập.",
      "Phản xạ trả lời phỏng vấn khẩu ngữ không cần phiên dịch ngầm tiếng Việt.",
      "Chuẩn hóa câu chữ 把 (Bǎ) và câu so sánh 比 (Bǐ) trong khẩu ngữ.",
    ],
  },
  "HSK 4": {
    level: "HSK 4",
    hskkEquiv: "HSKK Trung cấp nâng cao",
    vocabTarget: "1.200 từ vựng",
    headline: "Thảo luận chuyên sâu các chủ đề xã hội, lối sống và công sở",
    milestones: [
      "Tranh luận, bày tỏ quan điểm đồng ý hoặc phản bác văn minh bằng tiếng Trung.",
      "Thuyết trình mạch lạc theo kết cấu: Đặt vấn đề - Luận cứ - Kết luận.",
      "Sử dụng từ vựng trừu tượng, phó từ nối câu (其实, 究竟, 顺便).",
      "Độ trôi chảy đạt 120 - 150 âm tiết/phút với ngữ điệu tự nhiên.",
    ],
  },
  "HSK 5": {
    level: "HSK 5",
    hskkEquiv: "HSKK Cao cấp",
    vocabTarget: "2.500 từ vựng",
    headline: "Giao tiếp lưu loát như người bản xứ, đọc hiểu báo chí & phỏng vấn chuyên nghiệp",
    milestones: [
      "Sử dụng thành thạo thành ngữ (成语) thông dụng trong ngữ cảnh thích hợp.",
      "Tham gia thảo luận học thuật, kinh tế, thương mại không gặp rào cản từ vựng.",
      "Biến điệu thanh điệu mượt mà, ngắt nhịp theo cụm ngữ pháp chuẩn xác.",
      "Phản xạ tư duy trực tiếp bằng tiếng Trung với độ trễ phản hồi < 1 giây.",
    ],
  },
  "HSK 6": {
    level: "HSK 6",
    hskkEquiv: "HSKK Cao cấp xuất sắc",
    vocabTarget: "5.000+ từ vựng",
    headline: "Làm chủ hoàn toàn khẩu ngữ tiếng Trung chuyên sâu và tinh tế",
    milestones: [
      "Diễn đạt ẩn ý, cảm xúc tinh tế và đàm phán thương mại cấp cao.",
      "Thuyết trình ngẫu hứng trước đám đông với văn phong học thuật chuẩn mực.",
      "Vốn từ ngữ phong phú, làm chủ các cấu trúc cổ điển và quán ngữ khẩu ngữ.",
      "Đạt điểm xuất sắc trong mọi kỳ thi HSKK Cao cấp và phỏng vấn du học/việc làm.",
    ],
  },
};

function getBrowserLocalSessions(): any[] {
  if (typeof window === "undefined") return [];
  const foundMap = new Map<string, any>();

  // 1. Check aihsk_recent_sessions
  try {
    const raw = localStorage.getItem("aihsk_recent_sessions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          if (s && s.id) foundMap.set(s.id, s);
        }
      }
    }
  } catch {}

  // 2. Scan all aihsk_active_session_* keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("aihsk_active_session_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const s = JSON.parse(raw);
            if (s && s.id) {
              const existing = foundMap.get(s.id);
              if (!existing || (!existing.result && s.result)) {
                foundMap.set(s.id, s);
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  return Array.from(foundMap.values());
}

export function ProgressClient({
  initialSessions,
  initialProfile,
}: {
  initialSessions: any[];
  initialProfile: any;
}) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [selectedRoadmapLevel, setSelectedRoadmapLevel] = useState<string>(
    initialProfile?.targetLevel?.startsWith("HSK") ? initialProfile.targetLevel : "HSK 3"
  );

  useEffect(() => {
    const localList = getBrowserLocalSessions();
    const mergedMap = new Map<string, any>();

    for (const s of initialSessions) {
      if (s && s.id) mergedMap.set(s.id, s);
    }

    let hasNew = false;
    for (const ls of localList) {
      if (!ls || !ls.id) continue;
      const existing = mergedMap.get(ls.id);
      if (!existing) {
        mergedMap.set(ls.id, ls);
        hasNew = true;
      } else if (!existing.result && ls.result) {
        mergedMap.set(ls.id, { ...existing, ...ls });
        hasNew = true;
      }
    }

    if (hasNew || localList.length > 0) {
      const valid = Array.from(mergedMap.values()).filter(
        (s: any) => s && (s.result || s.status === "COMPLETED")
      );
      setSessions(valid);
    }
  }, [initialSessions]);

  // Compute stats if we have sessions
  const chronological = [...sessions].sort(
    (a, b) =>
      new Date(a.completedAt || a.createdAt || 0).getTime() -
      new Date(b.completedAt || b.createdAt || 0).getTime()
  );

  const hasData = chronological.length > 0;
  const initialSession = hasData ? chronological[0] : null;
  const initialScore = initialSession?.result?.overallScore || 0;
  const initialLevel =
    (initialSession?.result as any)?.hskEstimate ||
    (initialSession?.template as any)?.targetLevel ||
    "HSK 1";

  const latestSession = hasData ? chronological[chronological.length - 1] : null;
  const latestScore = latestSession?.result?.overallScore || 0;
  const currentLevel =
    (latestSession?.result as any)?.hskEstimate ||
    initialProfile?.targetLevel ||
    "HSK 1";

  const highestScore = hasData
    ? Math.max(...chronological.map((s) => s.result?.overallScore || 0))
    : 0;

  const growthDelta = Number((latestScore - initialScore).toFixed(1));

  // Find the most recent session that has dimension breakdowns
  const sessionWithDimensions = hasData
    ? [...chronological].reverse().find(
        (s) => Array.isArray(s.result?.scoreDimensions) && s.result.scoreDimensions.length > 0
      ) || latestSession
    : null;

  const initialSessionWithDimensions = hasData
    ? chronological.find(
        (s) => Array.isArray(s.result?.scoreDimensions) && s.result.scoreDimensions.length > 0
      ) || initialSession
    : null;

  const latestDimensions = (sessionWithDimensions?.result as any)?.scoreDimensions || [];
  const initialDimensions = (initialSessionWithDimensions?.result as any)?.scoreDimensions || [];

  const roadmapInfo =
    HSK_ROADMAP_MILESTONES[selectedRoadmapLevel] || HSK_ROADMAP_MILESTONES["HSK 3"];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Level Summary Cards */}
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardContent className="p-5 space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Điểm Chuẩn Khởi Đầu
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {formatScore(initialScore)}{" "}
                <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {formatDate(initialSession?.completedAt || initialSession?.createdAt)} &bull;{" "}
                  {initialLevel}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardContent className="p-5 space-y-1.5">
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
                    <Minus className="h-3.5 w-3.5" />{" "}
                    {chronological.length === 1 ? "Bài khảo thí đầu tiên" : "Điểm số ổn định"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardContent className="p-5 space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tổng Lượt Khảo Thí
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {chronological.length}{" "}
                <span className="text-xs text-slate-400 font-normal">bài thi</span>
              </div>
              <p className="text-xs text-slate-500 pt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Đã chấm theo chuẩn HSK 3.0</span>
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs">
            <CardContent className="p-5 space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trình Độ Ước Tính
              </span>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 truncate">
                {currentLevel}
              </div>
              <p className="text-xs text-slate-500 pt-1 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-slate-400" />
                <span>Mục tiêu: {initialProfile?.targetLevel || "HSK 3"}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Zero Session Welcome & Roadmap Blueprint Card */
        <Card className="rounded-3xl border border-rose-100 dark:border-rose-950/50 bg-gradient-to-br from-rose-50/60 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Bản Đồ Năng Lực Khẩu Ngữ Tiếng Trung HSK 3.0</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Khám Phá &amp; Đo Lường Năng Lực Nói Tiếng Trung Của Bạn
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Hệ thống AIHSK đánh giá khách quan dựa trên 7 chiều kích ngôn ngữ học thực tế từ giọng nói của bạn (không sử dụng điểm số giả lập). Hãy hoàn thành bài khảo thí đầu tiên để kích hoạt biểu đồ tiến độ và lộ trình cải thiện cá nhân hóa!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0 w-full md:w-auto">
              <Link href="/dashboard/assessments" className="w-full sm:w-auto">
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-sm">
                  <Mic className="h-4 w-4" />
                  <span>Làm Bài Khảo Thí Ngay</span>
                </Button>
              </Link>
              <Link href="/dashboard/free-talk" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full font-bold text-xs h-11 px-4 rounded-2xl flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <MessageCircle className="h-4 w-4 text-rose-600" />
                  <span>Luyện Nói Tự Do</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 7-Dimension Readiness / Performance Matrix */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-rose-600" />
                <span>
                  {hasData
                    ? "Mức Độ Thành Thạo Theo 7 Chiều Kích (Thực Tế)"
                    : "Khung Đánh Giá 7 Chiều Kích Khẩu Ngữ HSK 3.0"}
                </span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                {hasData
                  ? `Dữ liệu đo lường từ bài thi gần nhất (${formatDate(
                      latestSession?.completedAt || latestSession?.createdAt
                    )})`
                  : "Mỗi câu trả lời của bạn được phân tích quang phổ âm thanh và trích xuất đặc trưng ngôn ngữ học"}
              </p>
            </div>

            {hasData && sessionWithDimensions && (
              <Badge variant="outline" className="text-xs self-start sm:self-auto py-1 px-2.5">
                {sessionWithDimensions.template?.title || "Khảo thí khẩu ngữ"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-1 space-y-5">
          {hasData && latestDimensions.length > 0 ? (
            /* Real Measured Dimensions */
            latestDimensions.map((dim: any, idx: number) => {
              const score = typeof dim.score === "number" ? dim.score : 0;
              const max =
                typeof dim.maxScore === "number" && dim.maxScore > 0 ? dim.maxScore : 20;
              const percent = Math.min(100, Math.max(0, Math.round((score / max) * 100)));

              let deltaDisplay: string | null = null;
              let isPositive = true;

              if (chronological.length > 1) {
                const initDim = initialDimensions.find(
                  (d: any) =>
                    (d.dimensionKey && d.dimensionKey === dim.dimensionKey) ||
                    (d.dimensionName && d.dimensionName === dim.dimensionName)
                );
                if (initDim && initDim.maxScore) {
                  const initPercent = (initDim.score / initDim.maxScore) * 100;
                  const diff = Number((percent - initPercent).toFixed(1));
                  deltaDisplay = diff >= 0 ? `+${diff}%` : `${diff}%`;
                  isPositive = diff >= 0;
                }
              }

              const dimMeta =
                (dim.dimensionKey && DIM_LABELS[dim.dimensionKey]) || null;
              const displayName =
                dimMeta?.title || dim.dimensionName || `Kỹ năng ${idx + 1}`;
              const desc = dimMeta?.desc || dim.feedback || "";

              return (
                <div key={dim.id || dim.dimensionKey || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {displayName}
                      </span>
                      {dimMeta?.weight && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Trọng số: {dimMeta.weight})
                        </span>
                      )}
                      {dim.performanceLevel && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 text-slate-500"
                        >
                          {dim.performanceLevel}
                        </Badge>
                      )}
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
                              isPositive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600"
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

                  {desc && (
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {desc}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            /* Educational Readiness Matrix (When 0 Sessions) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(DIM_LABELS).map(([key, item]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                      Trọng số: {item.weight}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-rose-500/40 h-full rounded-full w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* HSK Interactive Roadmap & Milestones */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardHeader className="p-5 sm:p-6 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Compass className="h-5 w-5 text-rose-600" />
                <span>Lộ Trình Cột Mốc Khẩu Ngữ Theo Cấp HSK</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Tiêu chuẩn năng lực khẩu ngữ tương ứng các kỳ thi HSK 3.0 &amp; HSKK chính thức
              </p>
            </div>

            {/* Level Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {(["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"] as const).map(
                (level) => {
                  const isActive = selectedRoadmapLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedRoadmapLevel(level)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isActive
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {level}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-1 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {roadmapInfo.level} &bull; {roadmapInfo.hskkEquiv}
                </span>
                {initialProfile?.targetLevel === selectedRoadmapLevel && (
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px]">
                    Mục tiêu của bạn
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="text-xs font-semibold text-slate-600">
                <BookOpen className="h-3 w-3 mr-1" />
                Vốn từ: {roadmapInfo.vocabTarget}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              {roadmapInfo.headline}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {roadmapInfo.milestones.map((m, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Sessions Trajectory (Only when hasData) */}
      {hasData && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-rose-600" />
              <span>Lịch Sử Tiến Trình Khảo Thí ({chronological.length})</span>
            </h2>

            <Link href="/dashboard/assessments">
              <Button
                variant="outline"
                className="text-xs h-8 px-3 rounded-xl border-slate-200 dark:border-slate-800 font-bold"
              >
                <Mic className="h-3.5 w-3.5 mr-1 text-rose-600" />
                Làm bài thi mới
              </Button>
            </Link>
          </div>

          {/* Mobile View (< 640px) */}
          <div className="block sm:hidden space-y-3">
            {chronological.map((s, idx) => (
              <div
                key={s.id || idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(s.completedAt || s.createdAt)}
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
                      {(s.result as any)?.hskEstimate ||
                        (s as any).template?.targetLevel ||
                        "HSK"}
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
                {chronological.map((s, idx) => (
                  <tr
                    key={s.id || idx}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      {(s as any).template?.title || "Bài thi khảo thí"}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {formatDate(s.completedAt || s.createdAt)}
                    </td>
                    <td className="py-3.5 px-5 font-black text-rose-600 dark:text-rose-400 text-sm">
                      {formatScore(s.result?.overallScore || 0)}/100
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-700 dark:text-slate-300">
                      {(s.result as any)?.hskEstimate ||
                        (s as any).template?.targetLevel ||
                        "HSK"}
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
      )}
    </div>
  );
}
