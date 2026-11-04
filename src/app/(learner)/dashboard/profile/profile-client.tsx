"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  GraduationCap,
  Globe2,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
  Flame,
  Award,
  Zap,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Compass,
} from "lucide-react";

interface ProfileClientProps {
  initialData: {
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
    targetLevel: string;
    nativeLanguage: string;
    studyHoursWeekly: number;
    learningGoal: string;
    streakDays?: number;
    totalMastered?: number;
  };
}

interface HskLevelOption {
  level: string;
  zh: string;
  title: string;
  words: string;
  description: string;
  cefr: string;
  badgeBg: string;
  badgeText: string;
}

const HSK_CARDS: HskLevelOption[] = [
  {
    level: "HSK 1",
    zh: "入门 · Sơ cấp 1",
    title: "Làm quen & Phát âm cơ bản",
    words: "150 từ vựng",
    description: "Tự giới thiệu, đếm số, chào hỏi và nắm chắc 4 thanh điệu chuẩn xác cùng AI.",
    cefr: "A1",
    badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    badgeText: "Khởi đầu",
  },
  {
    level: "HSK 2",
    zh: "基础 · Sơ cấp 2",
    title: "Sinh hoạt & Mua sắm đời sống",
    words: "300 từ vựng",
    description: "Giao tiếp tình huống hàng ngày: hỏi đường, ăn uống, xem giá và trao đổi thời tiết.",
    cefr: "A2",
    badgeBg: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    badgeText: "Căn bản",
  },
  {
    level: "HSK 3",
    zh: "进阶 · Trung cấp 1",
    title: "Độc lập trao đổi đời sống",
    words: "600 từ vựng",
    description: "Trao đổi du lịch, sở thích, giải thích nguyên nhân và diễn đạt suy nghĩ cá nhân.",
    cefr: "B1",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    badgeText: "Khuyên Dùng",
  },
  {
    level: "HSK 4",
    zh: "提高 · Trung cấp 2",
    title: "Thuyết trình & Lập luận khẩu ngữ",
    words: "1200 từ vựng",
    description: "Thảo luận về các chủ đề văn hóa, xã hội, công nghệ và phản biện lưu loát cùng AI.",
    cefr: "B2",
    badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    badgeText: "Phổ Biến",
  },
  {
    level: "HSK 5",
    zh: "高级 · Cao cấp 1",
    title: "Đàm phán & Tư duy chuyên sâu",
    words: "2500 từ vựng",
    description: "Vận dụng thành ngữ (成语), đàm phán hợp đồng, thuyết trình và bảo vệ luận điểm.",
    cefr: "C1",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    badgeText: "Chuyên Sâu",
  },
  {
    level: "HSK 6",
    zh: "精通 · Cao cấp 2",
    title: "Lưu loát đỉnh cao như bản xứ",
    words: "5000+ từ vựng",
    description: "Làm chủ ngữ điệu tinh tế, phân tích văn hóa sâu sắc và phản xạ ngôn ngữ bản xứ.",
    cefr: "C2",
    badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    badgeText: "Bản Ngữ",
  },
];

const NATIVE_LANGUAGE_OPTIONS = [
  { value: "Tiếng Việt", label: "Tiếng Việt", flag: "🇻🇳", desc: "Tối ưu bộ lọc âm thanh điệu & âm uốn lưỡi zh/ch/sh" },
  { value: "English", label: "English", flag: "🇬🇧", desc: "Acoustic model tuned for English phonetic background" },
  { value: "한국어", label: "한국어 (Korean)", flag: "🇰🇷", desc: "한국어 화자를 위한 성조 분석 모델" },
  { value: "日本語", label: "日本語 (Japanese)", flag: "🇯🇵", desc: "日本語母語話者向け声調・母音認識モデル" },
  { value: "Tiếng Pháp (Français)", label: "Français", flag: "🇫🇷", desc: "Modèle acoustique adapté aux francophones" },
  { value: "Khác", label: "Ngôn ngữ khác", flag: "🌐", desc: "Chuẩn âm học quốc tế IPA mặc định" },
];

const STUDY_HOUR_PRESETS = [
  { hours: 2, label: "2 giờ / tuần", badge: "Khởi động nhẹ nhàng", tip: "~15-20 phút mỗi ngày" },
  { hours: 3, label: "3 giờ / tuần", badge: "Tiêu chuẩn đề xuất", tip: "~30 phút mỗi ngày", popular: true },
  { hours: 5, label: "5 giờ / tuần", badge: "Tăng tốc bứt phá", tip: "~45 phút mỗi ngày" },
  { hours: 8, label: "8 giờ / tuần", badge: "Cường độ cao cấp tốc", tip: "~1 - 1.5 giờ mỗi ngày" },
];

const GOAL_SUGGESTIONS = [
  "🎯 Luyện thi HSKK Khẩu ngữ đạt điểm tối đa",
  "🎓 Săn học bổng du học Trung Quốc (CSC, CIS)",
  "💼 Phỏng vấn xin việc & Giao tiếp thương mại",
  "🗣️ Chuẩn hóa ngữ điệu & Phản xạ tự nhiên cùng AI",
  "✈️ Du lịch tự túc, ẩm thực & Giao lưu văn hóa",
  "📚 Mở rộng vốn từ vựng & Đọc hiểu tin tức",
];

function getInitials(name: string): string {
  if (!name) return "HV";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function cleanHsk(level: string): string {
  const m = level.match(/HSK\s*[1-6]/i);
  return m ? m[0].toUpperCase().replace("HSK", "HSK ") : "HSK 3";
}

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [targetLevel, setTargetLevel] = useState(cleanHsk(initialData.targetLevel));
  const [nativeLanguage, setNativeLanguage] = useState(initialData.nativeLanguage || "Tiếng Việt");
  const [studyHoursWeekly, setStudyHoursWeekly] = useState(initialData.studyHoursWeekly || 3);
  const [learningGoal, setLearningGoal] = useState(initialData.learningGoal || "");

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedHskCard = HSK_CARDS.find((c) => c.level === targetLevel) || HSK_CARDS[2];

  const handleReset = () => {
    setName(initialData.name);
    setTargetLevel(cleanHsk(initialData.targetLevel));
    setNativeLanguage(initialData.nativeLanguage || "Tiếng Việt");
    setStudyHoursWeekly(initialData.studyHoursWeekly || 3);
    setLearningGoal(initialData.learningGoal || "");
    setStatusMessage(null);
  };

  const handleGoalChipClick = (suggestion: string) => {
    // If empty, set it directly. If already has content, append or replace smoothly.
    if (!learningGoal.trim()) {
      setLearningGoal(suggestion);
    } else if (!learningGoal.includes(suggestion)) {
      setLearningGoal((prev) => `${prev.trim()}\n• ${suggestion}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          targetLevel,
          nativeLanguage,
          studyHoursWeekly: Number(studyHoursWeekly),
          learningGoal: learningGoal.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu thông tin hồ sơ");
      }

      // Update in-place so subsequent reset or navigation uses the saved values
      initialData.name = name.trim();
      initialData.targetLevel = targetLevel;
      initialData.nativeLanguage = nativeLanguage;
      initialData.studyHoursWeekly = Number(studyHoursWeekly);
      initialData.learningGoal = learningGoal.trim();

      setStatusMessage({
        type: "success",
        text: "Tuyệt vời! Đã cập nhật hồ sơ học viên & cấu hình mục tiêu HSK thành công.",
      });

      // Refresh Next.js server components cache across the app
      router.refresh();

      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          HERO LEARNER PROFILE HEADER (Clean, modern, cover-free)
          ========================================================================= */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Learner Details */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md select-none border border-slate-200/60 dark:border-slate-700">
                {getInitials(name || initialData.email)}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm"
                title="Tài khoản đã xác thực"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {name || "Học Viên"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
                  <Target className="w-3 h-3" />
                  Mục tiêu: {targetLevel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {initialData.email}
              </p>
            </div>
          </div>

          {/* Quick stats badges & AI indicator */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Chuỗi học tập</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{initialData.streakDays ?? 1} ngày liên tiếp</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Thời lượng</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{studyHoursWeekly}h / tuần</div>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Lộ trình AI thích ứng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-3 border shadow-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* =========================================================================
          MAIN EDITING FORM & ROADMAP OVERVIEW
          ========================================================================= */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Settings (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION 1: HSK LEVEL SELECTION (Visual 6 Cards) */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    Cấp Độ HSK Mục Tiêu
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Chọn trình độ bạn đang hướng tới. Giám khảo AI sẽ chuẩn hóa câu hỏi phỏng vấn và tiêu chí chấm điểm theo cấp độ này.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-bold border-rose-200 text-rose-600 bg-rose-50/50">
                  Chuẩn HSK 3.0 & HSKK
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HSK_CARDS.map((card) => {
                  const isSelected = targetLevel === card.level;
                  return (
                    <button
                      key={card.level}
                      type="button"
                      onClick={() => setTargetLevel(card.level)}
                      className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-500 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20 shadow-sm"
                          : "border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      {/* Top row: Level & Selection Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-sm font-black tracking-tight ${
                            isSelected ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {card.level}
                        </span>

                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-rose-400 transition-colors" />
                        )}
                      </div>

                      {/* Vocabulary count */}
                      <div className="text-[11px] font-bold text-rose-600/90 dark:text-rose-400 mb-2">
                        {card.words}
                      </div>

                      {/* Brief description */}
                      <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {card.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: STUDY HOURS WEEKLY (Interactive Stepper & Presets) */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                Thời Lượng Luyện Khẩu Ngữ Hàng Tuần
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Thiết lập cam kết thời gian luyện phản xạ khẩu ngữ để AI nhắc nhở và phân bổ bài thi định kỳ.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Prominent display */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/50">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                    {studyHoursWeekly} <span className="text-base font-semibold text-slate-600 dark:text-slate-300">giờ / tuần</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Tương đương ~{Math.max(1, Math.round(studyHoursWeekly * 1.5))} bài thi phỏng vấn AI / tuần
                </div>
              </div>

              {/* Preset buttons */}
              <div>
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2.5 block">
                  Chọn nhanh mục tiêu cam kết:
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {STUDY_HOUR_PRESETS.map((preset) => {
                    const isSelected = studyHoursWeekly === preset.hours;
                    return (
                      <button
                        key={preset.hours}
                        type="button"
                        onClick={() => setStudyHoursWeekly(preset.hours)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 font-bold"
                            : "border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="text-xs font-bold">{preset.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{preset.tip}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Range Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>1 giờ (Tối thiểu)</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Kéo thanh để tùy chỉnh (1 - 20 giờ)</span>
                  <span>20 giờ (Tối đa)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={studyHoursWeekly}
                  onChange={(e) => setStudyHoursWeekly(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: LEARNING GOAL & EXAM AMBITION (Chips + Rich Textarea) */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
                Mục Tiêu & Định Hướng Học Tập
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Chia sẻ lý do và mục tiêu học tiếng Trung của bạn để Giám khảo AI cá nhân hóa ngữ cảnh các buổi phỏng vấn khẩu ngữ.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Quick Goal Chips */}
              <div>
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
                  Nhấp để thêm nhanh mục tiêu phổ biến:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_SUGGESTIONS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleGoalChipClick(goal)}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition-all font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <span>+</span>
                      <span>{goal}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <textarea
                  id="learningGoal"
                  rows={4}
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="Ví dụ: Mình cần thi đỗ chứng chỉ HSK 4 và HSKK Trung cấp trong 3 tháng tới để kịp nộp hồ sơ xin học bổng du học Bắc Kinh..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>Càng chi tiết, AI càng tạo được câu hỏi khảo thí sát thực tế hơn.</span>
                  <span>{learningGoal.length} ký tự</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4: PERSONAL INFO & NATIVE LANGUAGE */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80 p-5 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                Thông Tin Cá Nhân & Ngôn Ngữ Mẹ Đẻ
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tên hiển thị trên chứng nhận khảo thí và cấu hình nhận diện ngữ âm AI.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full name input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Họ và Tên Học Viên
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    required
                    className="h-11 text-sm rounded-2xl border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500"
                  />
                </div>

                {/* Email (fixed) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Địa Chỉ Email
                    </Label>
                    <span className="text-[10px] text-slate-400">Đã đồng bộ</span>
                  </div>
                  <Input
                    id="email"
                    value={initialData.email}
                    disabled
                    className="h-11 text-sm rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-slate-500 cursor-not-allowed border-dashed"
                  />
                </div>
              </div>

              {/* Native Language visual selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-slate-400" />
                    Ngôn Ngữ Mẹ Đẻ (Native Language)
                  </Label>
                  <span className="text-[11px] text-slate-400">Dùng cho bộ phân tích âm học AI</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {NATIVE_LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = nativeLanguage === lang.value;
                    return (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setNativeLanguage(lang.value)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold"
                            : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="text-xl shrink-0">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{lang.label}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  💡 <strong>Gợi ý ngữ âm:</strong> Hệ thống AI tự động áp dụng bộ lọc nhận dạng lỗi sai thanh điệu (thanh 1 vs thanh 4) và các cặp phụ âm uốn lưỡi (z/c/s vs zh/ch/sh) thường gặp của người Việt Nam.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SUBMIT ACTION BUTTON BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isSaving}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold flex items-center gap-2 rounded-2xl h-11 px-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Ban Đầu</span>
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold text-sm h-11 px-8 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-rose-500/20 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang Lưu Thay Đổi...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Lưu Hồ Sơ & Mục Tiêu</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: AI RoadMap Summary & Examiner Tips (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Roadmap Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Lộ Trình Đang Thiết Lập
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Target Highlight */}
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400">
                    Cấp độ mục tiêu
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {targetLevel}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedHskCard.title}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {selectedHskCard.words}
                </div>
              </div>

              {/* Commitment Pill */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Luyện tập hàng tuần:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{studyHoursWeekly} giờ</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-500" />
                    Ngôn ngữ mẹ đẻ:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{nativeLanguage}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-500" />
                    Độ trễ phản xạ AI:
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Tối ưu ~1.2s</span>
                </div>
              </div>

              {/* Examiner Note */}
              <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                🤖 <strong>Giám khảo AI thông báo:</strong> Toàn bộ các kỳ khảo thí mô phỏng (Phần 1, 2, 3) sẽ tự động nạp kho đề thi phù hợp với <strong>{targetLevel}</strong> ngay khi bạn bấm lưu.
              </div>
            </CardContent>
          </Card>

          {/* Speaking Examiner Pro Tips */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Bí Quyết Khẩu Ngữ HSKK
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block mb-0.5">Luyện đều hơn dồn cục</strong>
                  Luyện 15-20 phút mỗi ngày mang lại phản xạ ngữ âm tốt hơn 2-3 tiếng dồn vào cuối tuần.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block mb-0.5">Cấu trúc 3 bước khi trả lời</strong>
                  Mở bài trực tiếp ➔ Đưa ra 1-2 dẫn chứng cụ thể ➔ Đúc kết ngắn gọn để ghi điểm trọn vẹn.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-100 block mb-0.5">Đừng sợ ngắt nhịp nhẹ</strong>
                  Dùng các liên từ tự nhiên như &quot;首先...&quot;, &quot;另外...&quot;, &quot;我认为...&quot; để tạo thời gian suy nghĩ thay vì im lặng.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
