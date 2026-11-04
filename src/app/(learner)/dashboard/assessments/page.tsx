"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Clock,
  Layers,
  Loader2,
  Sparkles,
  CheckCircle2,
  Compass,
  ArrowRight,
  BookOpen,
  Wand2,
  ChevronRight,
  Flame,
  Search,
  MessageCircle,
  AlertCircle,
  X,
} from "lucide-react";

interface AssessmentTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  targetLevel: string;
  estimatedDurationMinutes: number;
  maxTurns: number;
}

const QUICK_CHIPS = [
  { label: "🍜 Gọi món nhà hàng", topic: "Gọi món ăn tại nhà hàng Tứ Xuyên và miêu tả khẩu vị", level: "HSK 2" },
  { label: "✈️ Du lịch & Hỏi đường", topic: "Hỏi đường đến ga tàu cao tốc và làm thủ tục khách sạn", level: "HSK 3" },
  { label: "💼 Phỏng vấn xin việc", topic: "Phỏng vấn xin việc vị trí kinh doanh và giới thiệu thế mạnh", level: "HSK 4" },
  { label: "🛍️ Mua sắm & Mặc cả", topic: "Mua sắm quần áo và thương lượng giá cả tại chợ Bắc Kinh", level: "HSK 3" },
  { label: "🤝 Đàm phán thương mại", topic: "Đàm phán hợp đồng cung ứng và phương thức thanh toán quốc tế", level: "HSK 5" },
  { label: "🎬 Phim ảnh & Sở thích", topic: "Chia sẻ sở thích xem phim tiếng Trung và nghe nhạc", level: "HSK 2" },
  { label: "🤖 AI & Công nghệ mới", topic: "Quan điểm về trí tuệ nhân tạo và ứng dụng học ngoại ngữ", level: "HSK 4" },
  { label: "🎓 Du học sinh & Học bổng", topic: "Phỏng vấn xin học bổng chính phủ Trung Quốc CSC", level: "HSK 4" },
];

const PRESET_TOPICS = [
  {
    icon: "🍜",
    title: "Ẩm thực & Gọi món nhà hàng",
    zh: "点餐与中国美食",
    level: "HSK 2",
    category: "Đời sống",
    desc: "Thực hành gọi món, hỏi giá tiền, miêu tả khẩu vị chua cay mặn ngọt tại quán ăn Trung Quốc.",
  },
  {
    icon: "✈️",
    title: "Du lịch, Đặt phòng & Hỏi đường",
    zh: "旅游、订房与问路",
    level: "HSK 3",
    category: "Du lịch",
    desc: "Tình huống hỏi đường đến danh lam thắng cảnh, bắt taxi, nhận phòng khách sạn và hỏi lịch trình.",
  },
  {
    icon: "💼",
    title: "Phỏng vấn xin việc & Kinh nghiệm",
    zh: "求职面试与工作经历",
    level: "HSK 4",
    category: "Nghề nghiệp",
    desc: "Trả lời câu hỏi tuyển dụng, giới thiệu thế mạnh bản thân, kinh nghiệm làm việc và định hướng nghề nghiệp.",
  },
  {
    icon: "🛍️",
    title: "Mua sắm, Mặc cả & Đổi trả hàng",
    zh: "购物、讨价还价与退换货",
    level: "HSK 3",
    category: "Mua sắm",
    desc: "Giao tiếp mua sắm quần áo, điện tử, hỏi giảm giá, thương lượng giá cả và thủ tục hoàn đổi hàng.",
  },
  {
    icon: "🎓",
    title: "Đời sống du học sinh & Đại học",
    zh: "大学生活与留学生涯",
    level: "HSK 3",
    category: "Học tập",
    desc: "Trò chuyện về môi trường học tập, giao lưu bạn bè quốc tế, ký túc xá và trải nghiệm văn hóa.",
  },
  {
    icon: "🤝",
    title: "Đàm phán kinh doanh & Hợp tác",
    zh: "商务谈判与商业合作",
    level: "HSK 5",
    category: "Thương mại",
    desc: "Thảo luận điều khoản hợp đồng, thanh toán, tiến độ giao hàng và xây dựng mối quan hệ đối tác.",
  },
  {
    icon: "🤖",
    title: "Công nghệ, AI & Mạng xã hội",
    zh: "人工智能与社交媒体",
    level: "HSK 4",
    category: "Khoa học",
    desc: "Bày tỏ quan điểm về ảnh hưởng của trí tuệ nhân tạo, ứng dụng học tiếng Trung và mạng xã hội.",
  },
  {
    icon: "🎵",
    title: "Giao lưu sở thích & Âm nhạc",
    zh: "兴趣爱好与影视娱乐",
    level: "HSK 2",
    category: "Giải trí",
    desc: "Chia sẻ bộ phim, bài hát tiếng Trung yêu thích, thói quen thể thao và giải trí cuối tuần.",
  },
];

const HSK_LEVELS = [
  { level: "HSK 1", label: "HSK 1 (Sơ cấp 1 - Cơ bản)" },
  { level: "HSK 2", label: "HSK 2 (Sơ cấp 2 - Giao tiếp)" },
  { level: "HSK 3", label: "HSK 3 (Trung cấp 1 - Độc lập)" },
  { level: "HSK 4", label: "HSK 4 (Trung cấp 2 - Thảo luận)" },
  { level: "HSK 5", label: "HSK 5 (Cao cấp 1 - Diễn đạt lưu loát)" },
  { level: "HSK 6", label: "HSK 6 (Cao cấp 2 - Thành thạo)" },
];

export default function AssessmentSelectionPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  // Active view tab: "custom" | "standard"
  const [activeTab, setActiveTab] = useState<"custom" | "standard">("custom");

  // Custom Topic Form state
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [customLevel, setCustomLevel] = useState("HSK 3");
  const [isStartingCustom, setIsStartingCustom] = useState(false);
  const [activePresetLoading, setActivePresetLoading] = useState<string | null>(null);
  const [errorModalMsg, setErrorModalMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assessments")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
        }
      })
      .catch((err) => console.error("Error fetching templates:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Start standard template
  const handleStartExam = async (templateId: string) => {
    setStartingId(templateId);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) throw new Error(data?.error || `Không thể bắt đầu bài thi (mã ${res.status})`);
      if (!data?.session?.id) throw new Error("Không nhận được mã phiên thi hợp lệ.");

      router.push(`/dashboard/assessments/${data.session.id}`);
    } catch (err: any) {
      console.error("Start exam error:", err);
      const friendlyMsg =
        err?.message?.includes("<!DOCTYPE") || err?.message?.includes("JSON")
          ? "Máy chủ đang khởi động hoặc gián đoạn kết nối. Vui lòng bấm thử lại."
          : err?.message || "Khởi động phòng thi thất bại.";
      setErrorModalMsg(friendlyMsg);
      setStartingId(null);
    }
  };

  // Start custom topic exam
  const handleStartCustomExam = async (topicToUse?: string, levelToUse?: string) => {
    const finalTopic = (topicToUse || customTopicInput).trim();
    const finalLevel = levelToUse || customLevel;

    if (!finalTopic) {
      setErrorModalMsg("Vui lòng nhập chủ đề bạn muốn luyện tập hoặc chọn từ danh sách gợi ý.");
      return;
    }

    if (topicToUse) {
      setActivePresetLoading(topicToUse);
    } else {
      setIsStartingCustom(true);
    }

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customTopic: finalTopic,
          targetLevel: finalLevel,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) throw new Error(data?.error || `Không thể tạo bài thi tự do (mã ${res.status})`);
      if (!data?.session?.id) throw new Error("Không nhận được mã phiên thi hợp lệ.");

      router.push(`/dashboard/assessments/${data.session.id}`);
    } catch (err: any) {
      console.error("Start custom exam error:", err);
      const friendlyMsg =
        err?.message?.includes("<!DOCTYPE") || err?.message?.includes("JSON")
          ? "Máy chủ đang khởi động hoặc gián đoạn kết nối. Vui lòng bấm thử lại."
          : err?.message || "Khởi tạo phòng thi tự do thất bại.";
      setErrorModalMsg(friendlyMsg);
      setIsStartingCustom(false);
      setActivePresetLoading(null);
    }
  };

  const handleSelectQuickChip = (chip: (typeof QUICK_CHIPS)[0]) => {
    setCustomTopicInput(chip.topic);
    setCustomLevel(chip.level);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. PAGE HEADER */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="cinnabar" className="text-xs font-bold">
            Khảo Thí Khẩu Ngữ AI
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            Giám khảo AI Lý Lão Sư (考官李老师)
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Lựa Chọn Hoặc Tự Do Tạo Chủ Đề Khảo Thí
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Tự do nhập bất kỳ chủ đề, ngữ cảnh nào bạn muốn luyện phản xạ, hoặc chọn các đề thi chuẩn hoá theo khung khảo thí HSK quốc tế. Giám khảo AI sẽ trực tiếp trò chuyện và phản biện 5 giai đoạn theo đúng chủ đề bạn đã chọn.
        </p>
      </div>

      {/* FREE-TALK PROMOTION CALLOUT */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/60 dark:border-amber-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Thấy bài thi 5 chặng quá gò bó?
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300">
                Mới &bull; Không áp lực điểm số
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Trải nghiệm ngay chế độ <strong>Trò Chuyện Tự Do (Free Talk)</strong> để tán gẫu tự nhiên theo ý bạn, có Pinyin và dịch nghĩa tiếng Việt tức thì!
            </p>
          </div>
        </div>
        <Link href="/dashboard/free-talk" className="shrink-0">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 px-4 text-xs gap-1.5 shadow-xs w-full sm:w-auto">
            <MessageCircle className="h-4 w-4" />
            <span>Vào Trò Chuyện Tự Do</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* 2. MODE SWITCHER TABS (Responsive Segmented Control) */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex max-w-md w-full">
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "custom"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Wand2 className="h-4 w-4 text-rose-600" />
          <span>Chủ Đề Tự Do</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("standard")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "standard"
              ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="h-4 w-4 text-rose-600" />
          <span>Đề Thi Chuẩn HSK ({templates.length})</span>
        </button>
      </div>

      {/* VIEW 1: CUSTOM / FREE TOPIC */}
      {activeTab === "custom" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Custom Topic Input Deck */}
          <Card className="border-rose-200/90 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/50 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm rounded-3xl p-5 sm:p-8">
            <div className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Tự tạo chủ đề theo ý muốn của bạn</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Bạn muốn phỏng vấn về chủ đề hoặc tình huống nào?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập bất kỳ tình huống nào bạn muốn rèn luyện (VD: đàm phán xuất nhập khẩu, đi khám bệnh, phỏng vấn xin học bổng, nói về sở thích...).
                </p>
              </div>

              {/* Quick Suggestion Chips (1-tap autofill for speed & ergonomics on mobile) */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Gợi ý chọn nhanh (chạm để điền):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {QUICK_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickChip(chip)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                        customTopicInput === chip.topic
                          ? "bg-rose-600 text-white border-rose-600 shadow-2xs font-bold"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300"
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span className="text-[10px] opacity-75">({chip.level})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input + Level selector + Start Button (Responsive Stacking) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="Nhập chủ đề bất kỳ (VD: Thuê nhà tại Bắc Kinh, Phỏng vấn học bổng...)"
                    className="w-full h-12 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleStartCustomExam();
                    }}
                  />
                </div>

                {/* Level selector */}
                <select
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value)}
                  className="h-12 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 sm:w-52 shrink-0"
                >
                  {HSK_LEVELS.map((lvl) => (
                    <option key={lvl.level} value={lvl.level}>
                      {lvl.label}
                    </option>
                  ))}
                </select>

                {/* Start Button */}
                <Button
                  onClick={() => handleStartCustomExam()}
                  disabled={isStartingCustom || !customTopicInput.trim()}
                  className="h-12 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 shrink-0 transition-all w-full sm:w-auto"
                >
                  {isStartingCustom ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang Khởi Tạo...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Bắt Đầu Khảo Thí</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preset Topics Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-rose-600" />
                  <span>Hoặc chọn nhanh từ các chủ đề gợi ý phổ biến:</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chạm trực tiếp vào chủ đề để vào phòng thi với Giám khảo AI ngay lập tức.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESET_TOPICS.map((preset, idx) => {
                const isThisLoading = activePresetLoading === preset.title;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!activePresetLoading) {
                        handleStartCustomExam(preset.title, preset.level);
                      }
                    }}
                    className={`group relative rounded-3xl border bg-white dark:bg-slate-900 p-5 hover:border-rose-400 dark:hover:border-rose-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                      isThisLoading
                        ? "border-rose-500 ring-2 ring-rose-500/20"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{preset.icon}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                            {preset.level}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                          {preset.title}
                        </h4>
                        <p className="text-xs font-semibold text-slate-400 font-sans mt-0.5">
                          {preset.zh}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                      {isThisLoading ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Đang vào phòng thi...</span>
                        </span>
                      ) : (
                        <>
                          <span>Chọn chủ đề này</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STANDARD HSK TEMPLATES */}
      {activeTab === "standard" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Đề Thi Khẩu Ngữ Chuẩn Hoá Theo Cấp Độ HSK
            </h3>
            <p className="text-xs text-slate-500">
              Các bài thi được thiết kế chuẩn mực theo khung khảo thí HSK và HSKK quốc tế 5 giai đoạn.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 transition-all shadow-sm rounded-3xl overflow-hidden"
                >
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="cinnabar" className="text-[10px] font-bold">
                        {tpl.targetLevel}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~{tpl.estimatedDurationMinutes} phút</span>
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold leading-tight">
                      {tpl.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-3">
                      {tpl.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-rose-500" />
                        <span>Phỏng vấn hội thoại 5 giai đoạn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                        <span>Chấm điểm đa chiều 7 tiêu chuẩn</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Chẩn đoán âm học biến điệu & Pinyin</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStartExam(tpl.id)}
                      disabled={Boolean(startingId)}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {startingId === tpl.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Đang Khởi Tạo Phòng Thi...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span>Vào Thi Khẩu Ngữ</span>
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modern Notice / Error Modal (Replacing Native Browser Alert) */}
      {errorModalMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-sm w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setErrorModalMsg(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Thông Báo Phòng Thi</h4>
                <p className="text-xs text-slate-500">Khảo thí khẩu ngữ AI</p>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {errorModalMsg}
            </p>
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                onClick={() => setErrorModalMsg(null)}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-8 px-4 font-bold"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
