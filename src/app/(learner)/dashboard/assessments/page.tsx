"use client";

import { useEffect, useState } from "react";
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

const PRESET_TOPICS = [
  {
    title: "Ẩm thực & Gọi món nhà hàng",
    zh: "点餐与中国美食",
    level: "HSK 2",
    desc: "Thực hành gọi món, hỏi giá tiền, miêu tả khẩu vị chua cay mặn ngọt tại quán ăn Trung Quốc.",
  },
  {
    title: "Du lịch, Đặt phòng & Hỏi đường",
    zh: "旅游、订房与问路",
    level: "HSK 3",
    desc: "Tình huống hỏi đường đến danh lam thắng cảnh, bắt taxi, nhận phòng khách sạn và hỏi lịch trình.",
  },
  {
    title: "Phỏng vấn xin việc & Giới thiệu kinh nghiệm",
    zh: "求职面试与工作经历",
    level: "HSK 4",
    desc: "Trả lời câu hỏi tuyển dụng, giới thiệu thế mạnh bản thân, kinh nghiệm làm việc và định hướng nghề nghiệp.",
  },
  {
    title: "Mua sắm, Mặc cả & Đổi trả hàng",
    zh: "购物、讨价还价与退换货",
    level: "HSK 3",
    desc: "Giao tiếp mua sắm quần áo, điện tử, hỏi giảm giá, thương lượng giá cả và thủ tục hoàn đổi hàng.",
  },
  {
    title: "Đời sống du học sinh & Cuộc sống đại học",
    zh: "大学生活与留学生涯",
    level: "HSK 3",
    desc: "Trò chuyện về môi trường học tập, giao lưu bạn bè quốc tế, ký túc xá và trải nghiệm văn hóa.",
  },
  {
    title: "Đàm phán kinh doanh & Hợp tác thương mại",
    zh: "商务谈判与商业合作",
    level: "HSK 5",
    desc: "Thảo luận điều khoản hợp đồng, thanh toán, tiến độ giao hàng và xây dựng mối quan hệ đối tác.",
  },
  {
    title: "Công nghệ, AI & Mạng xã hội trong đời sống",
    zh: "人工智能与社交媒体",
    level: "HSK 4",
    desc: "Bày tỏ quan điểm về ảnh hưởng của trí tuệ nhân tạo, ứng dụng học tiếng Trung và mạng xã hội.",
  },
  {
    title: "Giao lưu sở thích, Âm nhạc & Phim ảnh",
    zh: "兴趣爱好与影视娱乐",
    level: "HSK 2",
    desc: "Chia sẻ bộ phim, bài hát tiếng Trung yêu thích, thói quen thể thao và giải trí cuối tuần.",
  },
];

const HSK_LEVELS = [
  { level: "HSK 1", label: "HSK 1 (Sơ cấp cơ bản)" },
  { level: "HSK 2", label: "HSK 2 (Giao tiếp hàng ngày)" },
  { level: "HSK 3", label: "HSK 3 (Trung cấp B1)" },
  { level: "HSK 4", label: "HSK 4 (Trung cấp B2)" },
  { level: "HSK 5", label: "HSK 5 (Cao cấp C1)" },
  { level: "HSK 6", label: "HSK 6 (Thành thạo C2)" },
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể bắt đầu bài thi");

      router.push(`/dashboard/assessments/${data.session.id}`);
    } catch (err: any) {
      alert(err.message || "Khởi động phòng thi thất bại");
      setStartingId(null);
    }
  };

  // Start custom topic exam
  const handleStartCustomExam = async (topicToUse?: string, levelToUse?: string) => {
    const finalTopic = (topicToUse || customTopicInput).trim();
    const finalLevel = levelToUse || customLevel;

    if (!finalTopic) {
      alert("Vui lòng nhập chủ đề bạn muốn luyện tập hoặc chọn từ danh sách gợi ý.");
      return;
    }

    setIsStartingCustom(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customTopic: finalTopic,
          targetLevel: finalLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo bài thi tự do");

      router.push(`/dashboard/assessments/${data.session.id}`);
    } catch (err: any) {
      alert(err.message || "Khởi tạo phòng thi tự do thất bại");
      setIsStartingCustom(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="cinnabar" className="text-xs">
            Khảo Thí Khẩu Ngữ AI
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            Giám khảo AI Lý Lão Sư (考官李老师)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Lựa Chọn Hoặc Tự Do Tạo Chủ Đề Khảo Thí
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Bạn có thể <strong>tự do nhập bất kỳ chủ đề nào</strong> bạn muốn luyện tập, hoặc chọn các đề thi chuẩn hoá theo cấp độ HSK. Giám khảo AI sẽ trực tiếp thực hiện cuộc phỏng vấn 5 giai đoạn thích ứng theo đúng chủ đề bạn đã chọn.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "custom"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <Wand2 className="h-4 w-4" />
          <span>Tự Chọn Chủ Đề (Khảo Thí Tự Do)</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-normal">
            Linh hoạt
          </span>
        </button>

        <button
          onClick={() => setActiveTab("standard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "standard"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Đề Thi Chuẩn Hoá HSK ({templates.length})</span>
        </button>
      </div>

      {/* VIEW 1: CUSTOM / FREE TOPIC */}
      {activeTab === "custom" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Custom Topic Input Deck */}
          <Card className="border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/40 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm rounded-3xl p-6 sm:p-8">
            <div className="max-w-3xl space-y-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Tự tạo chủ đề theo ý muốn của bạn</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Bạn muốn phỏng vấn về chủ đề hoặc tình huống nào?
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập bất kỳ tình huống nào bạn muốn rèn luyện phản xạ (ví dụ: đàm phán xuất nhập khẩu, đi khám bệnh, phỏng vấn xin học bổng, nói về sở thích...).
                </p>
              </div>

              {/* Form Input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="Nhập chủ đề bất kỳ (VD: Thuê nhà tại Bắc Kinh, Phỏng vấn học bổng, Nói về ẩm thực Tứ Xuyên...)"
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleStartCustomExam();
                    }}
                  />
                </div>

                {/* Level selector */}
                <select
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value)}
                  className="h-12 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 sm:w-48"
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
                  className="h-12 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 shrink-0 transition-all"
                >
                  {isStartingCustom ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang Khởi Tạo...</span>
                    </>
                  ) : (
                    <>
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
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-rose-600" />
                <span>Hoặc chọn nhanh từ các chủ đề gợi ý phổ biến:</span>
              </h3>
              <p className="text-xs text-slate-500">
                Nhấn trực tiếp vào chủ đề để vào phòng thi với Giám khảo AI ngay lập tức.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESET_TOPICS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleStartCustomExam(preset.title, preset.level)}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-rose-400 dark:hover:border-rose-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                        {preset.level}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-rose-600 transition-colors">
                        5 giai đoạn
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 font-sans mt-0.5">
                        {preset.zh}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Chọn chủ đề này</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STANDARD HSK TEMPLATES */}
      {activeTab === "standard" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Đề Thi Khẩu Ngữ Chuẩn Hoá Theo Cấp Độ HSK & CEFR
            </h3>
            <p className="text-xs text-slate-500">
              Các bài thi được thiết kế chuẩn mực theo khung khảo thí HSKK và CEFR quốc tế.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="flex flex-col justify-between border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 transition-all shadow-sm rounded-3xl overflow-hidden"
                >
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="cinnabar" className="text-[10px]">
                        {tpl.targetLevel}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
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
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-10 rounded-xl flex items-center justify-center gap-2 shadow-sm"
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
    </div>
  );
}
