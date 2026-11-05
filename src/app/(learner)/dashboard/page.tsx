"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  Target,
  Flame,
  MessageCircle,
} from "lucide-react";
import { formatDate, formatScore, getScoreBadgeColor } from "@/lib/utils";

const LEVEL_RECOMMENDATIONS: Record<
  string,
  { title: string; zh: string; desc: string; duration: string; skills: string[] }
> = {
  "HSK 1": {
    title: "HSK 1: Làm Quen Ngữ Âm & Giao Tiếp Cơ Bản",
    zh: "HSK 1级 · 语音入门与日常问候",
    desc: "Chào hỏi, tự giới thiệu, hỏi thăm sức khỏe và luyện phát âm chuẩn xác 4 thanh điệu cùng Giám khảo AI.",
    duration: "10 Phút",
    skills: ["Phát âm 4 thanh", "Chào hỏi cơ bản", "Số đếm & Gia đình"],
  },
  "HSK 2": {
    title: "HSK 2: Sinh Hoạt Hàng Ngày & Mua Sắm",
    zh: "HSK 2级 · 生活情境与日常交流",
    desc: "Giao tiếp trong các tình huống mua sắm, ẩm thực, hỏi đường và thời tiết thường ngày với các mẫu câu thông dụng.",
    duration: "10 Phút",
    skills: ["Gọi món ẩm thực", "Hỏi đường & Giá cả", "Thời tiết & Sinh hoạt"],
  },
  "HSK 3": {
    title: "HSK 3: Thảo Luận Đời Sống & Du Lịch",
    zh: "HSK 3级 · 独立交流与旅行经历",
    desc: "Trao đổi về học tập, du lịch, thói quen và diễn đạt suy nghĩ với các cấu trúc liên từ kết nối câu cơ bản.",
    duration: "12 Phút",
    skills: ["Liên từ 因为...所以...", "Kể chuyện quá khứ", "Du lịch & Đặt phòng"],
  },
  "HSK 4": {
    title: "HSK 4: Lập Luận Khẩu Ngữ & Văn Hóa Trung Hoa",
    zh: "HSK 4级 · 话题思辨与深度交流",
    desc: "Nâng cấp từ hội thoại sinh hoạt sang thuyết trình quan điểm. Thảo luận về công nghệ, trải nghiệm văn hóa và luyện biến điệu thanh 3 cùng Giám khảo AI.",
    duration: "12 Phút",
    skills: ["Biện luận ưu/nhược điểm", "Biến điệu thanh 3", "Văn hóa & Đời sống"],
  },
  "HSK 5": {
    title: "HSK 5: Diễn Đạt Chuyên Sâu & Đàm Phán Thương Mại",
    zh: "HSK 5级 · 商务谈判与深度论述",
    desc: "Thảo luận về các chủ đề kinh tế - xã hội chuyên sâu, sử dụng thành ngữ phong phú và lập luận đa chiều trong môi trường làm việc.",
    duration: "15 Phút",
    skills: ["Thành ngữ (成语)", "Thương mại & Hợp đồng", "Lập luận đa góc nhìn"],
  },
  "HSK 6": {
    title: "HSK 6: Thành Thạo Khẩu Ngữ & Biện Luận Phức Hợp",
    zh: "HSK 6级 · 母语级流利与精细表达",
    desc: "Khả năng diễn ngôn lưu loát, tự nhiên như người bản xứ, phân tích văn hóa sâu sắc và phản biện luận điểm phức tạp.",
    duration: "15 Phút",
    skills: ["Diễn ngôn bản xứ", "Phản biện phức hợp", "Văn phong học thuật"],
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

  // 2. Scan all aihsk_active_session_* keys in localStorage
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

export default function LearnerDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Học Viên");
  const [userTargetLevel, setUserTargetLevel] = useState<string>("HSK 3");
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resolvedNotice, setResolvedNotice] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [meRes, assessRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/assessments").catch(() => null),
        ]);

        if (!meRes.ok) {
          router.replace("/login");
          return;
        }

        const meData = await meRes.json();
        if (isMounted && meData?.user) {
          setUserName(meData.user.name || "Học Viên");
          if (meData.user.profile?.targetLevel) {
            setUserTargetLevel(meData.user.profile.targetLevel);
          }
        }

        let fetchedSessions: any[] = [];
        if (assessRes && assessRes.ok) {
          const assessData = await assessRes.json();
          if (Array.isArray(assessData?.sessions)) {
            fetchedSessions = assessData.sessions;
          }
        }

        // Merge fetched sessions with resilient browser local storage
        const localSessions = getBrowserLocalSessions();
        const mergedMap = new Map<string, any>();

        for (const s of fetchedSessions) {
          if (s && s.id) mergedMap.set(s.id, s);
        }

        for (const ls of localSessions) {
          if (!ls || !ls.id) continue;
          const serverS = mergedMap.get(ls.id);
          if (!serverS) {
            mergedMap.set(ls.id, ls);
            fetch(`/api/assessments/${ls.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session: ls }),
            }).catch(() => null);
          } else if (!serverS.result && ls.result) {
            mergedMap.set(ls.id, { ...serverS, ...ls });
            fetch(`/api/assessments/${ls.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session: ls }),
            }).catch(() => null);
          }
        }

        const allSessions = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        if (isMounted) {
          setSessions(allSessions);
        }

        // Check for newly resolved support tickets
        fetch("/api/support/ticket")
          .then((res) => res.json())
          .then((d) => {
            if (isMounted && d.tickets && Array.isArray(d.tickets)) {
              const latestResolved = d.tickets.find((t: any) => t.status === "RESOLVED");
              if (latestResolved) {
                const dismissed = localStorage.getItem(`dismissed_ticket_${latestResolved.id}`);
                if (!dismissed) {
                  setResolvedNotice(latestResolved);
                }
              }
            }
          })
          .catch(() => {});
      } catch (e) {
        console.warn("Dashboard client fetch note:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const completedSessions = sessions.filter((s) => s && s.status === "COMPLETED" && s.result);
  const latestSession = completedSessions[0];

  const safeTargetLevel = String(userTargetLevel || "HSK 3");
  const matchedLevelKey =
    Object.keys(LEVEL_RECOMMENDATIONS).find((k) => safeTargetLevel.includes(k)) || "HSK 3";
  const recommendedAssessment =
    LEVEL_RECOMMENDATIONS[matchedLevelKey] || LEVEL_RECOMMENDATIONS["HSK 3"];

  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (Number(s?.result?.overallScore) || 0), 0) /
        completedSessions.length
      : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 0. RESOLVED SUPPORT TICKET NOTIFICATION BANNER */}
      {resolvedNotice && (
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-900 dark:text-emerald-100 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Kỹ Thuật Viên Đã Xử Lý Yêu Cầu Của Bạn
                </span>
                <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                  #{resolvedNotice.id}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {resolvedNotice.title}
              </p>
              {resolvedNotice.adminResponse && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
                  &ldquo;{resolvedNotice.adminResponse}&rdquo;
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Xem Chi Tiết & Hành Động</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(`dismissed_ticket_${resolvedNotice.id}`, "true");
                setResolvedNotice(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* 1. WELCOME BANNER (Hero Command Center) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-rose-500 to-rose-700 p-6 sm:p-8 text-white shadow-lg shadow-rose-600/15">
        {/* Subtle decorative Chinese calligraphy watermark background */}
        <div className="pointer-events-none absolute -right-6 -bottom-10 select-none opacity-10 font-serif text-9xl sm:text-[14rem] font-black text-white">
          说
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-medium text-rose-50 border border-white/20">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span>Phòng Khảo Thí Khẩu Ngữ AI Chuẩn Quốc Tế</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Chào mừng trở lại, {userName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
              Mục tiêu hiện tại:{" "}
              <strong className="text-white underline decoration-rose-300 underline-offset-4">
                {userTargetLevel}
              </strong>
              . Giám khảo AI Lý Lão Sư đã sẵn sàng cho bài phỏng vấn khẩu ngữ 5 giai đoạn thích ứng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link href="/dashboard/assessments" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-rose-700 hover:bg-rose-50 font-bold shadow-md hover:shadow-lg transition-all h-12 px-6 rounded-2xl flex items-center justify-center gap-2"
              >
                <Mic className="h-4 w-4 text-rose-600" />
                <span>Thi Ngay Bây Giờ</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/free-talk" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-md font-bold shadow-xs transition-all h-12 px-5 rounded-2xl flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                <span>Trò Chuyện Tự Do</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS & KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: Latest Score */}
        <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-rose-600" />
                <span>Điểm Khẩu Ngữ Gần Nhất</span>
              </span>
              {latestSession?.result && (
                <Badge variant="cinnabar" className="text-[10px] font-bold">
                  {latestSession.result.hskEstimate || "HSK"}
                </Badge>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {latestSession?.result ? formatScore(latestSession.result.overallScore) : "—"}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="truncate">
                {latestSession
                  ? formatDate(latestSession.createdAt)
                  : "Chưa hoàn thành bài thi nào"}
              </span>
              {latestSession?.result && (
                <Link
                  href={`/dashboard/reports/${latestSession.id}`}
                  className="text-rose-600 hover:text-rose-700 font-semibold text-[11px] shrink-0 hover:underline"
                >
                  Xem chẩn đoán &rarr;
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Average Score */}
        <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span>Điểm Trung Bình Tích Lũy</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Toàn bộ bài thi</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {avgScore !== null ? formatScore(avgScore) : "—"}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>
                {completedSessions.length > 0
                  ? `Dựa trên ${completedSessions.length} kỳ khảo thí`
                  : "Bắt đầu bài thi để tính trung bình"}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {avgScore !== null && avgScore >= 75
                  ? "Xuất sắc"
                  : avgScore !== null && avgScore >= 60
                  ? "Đạt chuẩn"
                  : "Đang tiến bộ"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Completed Assessments */}
        <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Kỳ Khảo Thí Đã Hoàn Thành</span>
              </span>
              <Badge variant="outline" className="text-[10px]">
                5 Chặng thích ứng
              </Badge>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {completedSessions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">lượt thi</span>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>Chẩn đoán âm học & Pinyin</span>
              <Link
                href="/dashboard/progress"
                className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] hover:underline"
              >
                Xem tiến độ &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. RECOMMENDED NEXT ASSESSMENT */}
      <Card className="rounded-3xl border border-rose-200/90 dark:border-rose-950 bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="cinnabar" className="text-xs font-bold">
                Đề xuất cho mục tiêu {userTargetLevel}
              </Badge>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Thời lượng: {recommendedAssessment.duration}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {recommendedAssessment.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium font-sans mt-0.5">
                {recommendedAssessment.zh}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {recommendedAssessment.desc}
            </p>

            {/* Tested Skill Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-semibold text-slate-500">Trọng tâm đánh giá:</span>
              {recommendedAssessment.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <Link href="/dashboard/assessments" className="w-full">
              <Button
                size="lg"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm h-12 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Mic className="h-4 w-4" />
                <span>Bắt Đầu Khảo Thí</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/assessments" className="w-full">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-xs font-semibold h-11 rounded-2xl border-slate-200 dark:border-slate-700"
              >
                Tự chọn chủ đề khác
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* HSKK VIRTUAL EXAM ROOM PROMO CARD */}
      <Card className="rounded-3xl border border-rose-200/90 dark:border-rose-900/40 bg-gradient-to-r from-rose-50/80 via-red-50/40 to-orange-50/50 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Phòng Thi Thử HSKK Ảo Chuẩn Quốc Tế (汉语水平口语考试)
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold bg-rose-100/70 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300">
                  Chuẩn CTI 2024
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Mô phỏng 100% phòng thi máy tính: Sơ cấp, Trung cấp &amp; Cao cấp. Có băng nghe, tín hiệu bíp '嘀' chuẩn, nhìn tranh nói và chấm điểm tự động.
              </p>
            </div>
          </div>

          <Link href="/dashboard/hskk" className="shrink-0">
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
            >
              <span>Vào Thi HSKK Ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* CASUAL FREE TALK PROMO CARD */}
      <Card className="rounded-3xl border border-amber-200/90 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-rose-50/50 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Phòng Trò Chuyện Tự Do (Free Talk)
                </h3>
                <Badge variant="outline" className="text-[10px] font-bold bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300">
                  Không áp lực khảo thí
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                Tán gẫu thoải mái cùng bạn học AI hoặc gia sư kiên nhẫn. Có Pinyin, dịch nghĩa tức thì và gợi ý câu trả lời thông minh.
              </p>
            </div>
          </div>

          <Link href="/dashboard/free-talk" className="shrink-0">
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs w-full sm:w-auto"
            >
              <span>Vào Tán Gẫu Ngay</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4. RECENT ASSESSMENT SESSIONS (Responsive: Table for Desktop, Cards for Mobile) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Lịch Sử Khảo Thí Gần Đây
              </h2>
              <p className="text-xs text-slate-500">
                Toàn bộ các phiên phỏng vấn và kết quả chẩn đoán khẩu ngữ của bạn
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600 mx-auto mb-2" />
            <p className="text-xs font-medium">Đang tải lịch sử khảo thí...</p>
          </div>
        ) : sessions.length === 0 ? (
          /* EMPTY STATE */
          <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-8 w-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Bạn chưa tham gia bài khảo thí nào
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              Bắt đầu bài phỏng vấn đầu tiên cùng Giám khảo AI để nhận chẩn đoán phát âm, ngữ pháp và ước tính trình độ HSK theo chuẩn quốc tế.
            </p>
            <Link href="/dashboard/assessments">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-6 rounded-2xl shadow-sm">
                Bắt Đầu Bài Thi Đầu Tiên &rarr;
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* MOBILE VIEW: Card List (< 640px) */}
            <div className="block sm:hidden space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : s.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {s.status === "COMPLETED"
                            ? "Đã có báo cáo"
                            : s.status === "IN_PROGRESS"
                            ? "Đang thi"
                            : "Đang xử lý"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(s.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {s.template?.title || "Khảo Thí Khẩu Ngữ"}
                      </h4>
                    </div>

                    {s.result && (
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                          {formatScore(s.result.overallScore)}
                          <span className="text-[10px] font-normal text-slate-400">/100</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {s.result.hskEstimate || s.result.hskLevel || "HSK"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {s.template?.targetLevel || "HSK"} &bull; 5 chặng thi
                    </span>

                    {s.status === "COMPLETED" ? (
                      <Link href={`/dashboard/reports/${s.id}`}>
                        <Button
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 text-xs h-8 px-3 rounded-xl font-bold"
                        >
                          Xem Chẩn Đoán
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/assessments/${s.id}`}>
                        <Button
                          size="sm"
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3 rounded-xl font-bold"
                        >
                          Tiếp Tục Thi
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Structured Table (>= 640px) */}
            <div className="hidden sm:block rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Bài Thi Khẩu Ngữ</th>
                    <th className="py-4 px-5">Thời Gian</th>
                    <th className="py-4 px-5">Trạng Thái</th>
                    <th className="py-4 px-5">Tổng Điểm</th>
                    <th className="py-4 px-5">Ước Tính HSK</th>
                    <th className="py-4 px-5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {sessions.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{s.template?.title || "Khảo Thí Khẩu Ngữ"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-500">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            s.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : s.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          }`}
                        >
                          {s.status === "COMPLETED"
                            ? "Đã có báo cáo"
                            : s.status === "IN_PROGRESS"
                            ? "Đang thi"
                            : "Đang xử lý"}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900 dark:text-white text-sm">
                        {s.result ? (
                          <span>{formatScore(s.result.overallScore)} / 100</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Đang chấm</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        {s.result ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {s.result.hskEstimate || s.result.hskLevel || "HSK"}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {s.status === "COMPLETED" ? (
                          <Link href={`/dashboard/reports/${s.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 px-3 rounded-xl font-bold border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                            >
                              Xem Chẩn Đoán &rarr;
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/dashboard/assessments/${s.id}`}>
                            <Button
                              size="sm"
                              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3 rounded-xl font-bold shadow-xs"
                            >
                              Tiếp Tục Thi
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
