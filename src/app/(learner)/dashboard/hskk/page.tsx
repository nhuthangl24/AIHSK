"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  PlayCircle,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Mic,
  ArrowRight,
  Loader2,
  FileText,
  Volume2,
  Check,
  ChevronRight,
  Flame,
  Settings,
  X,
} from "lucide-react";
import { HskkExamTemplate, HskkLevel } from "@/types/hskk";
import { formatScore, formatDate } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import {
  getSystemAudioSettings,
  saveSystemAudioSettings,
  getAvailableChineseVoices,
  speakWithSystemSettings,
  SystemAudioSettings,
  FIXED_VOICE_NAME,
  FIXED_VOICE_LABEL,
} from "@/lib/audio/system-audio-settings";

export default function HskkPortalPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<HskkExamTemplate[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<HskkLevel>("HSKK_INTERMEDIATE");
  const [examMode, setExamMode] = useState<"OFFICIAL" | "PRACTICE">("OFFICIAL");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // System Audio Settings
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(0.95);
  const [recognitionLang, setRecognitionLang] = useState("zh-CN");

  useEffect(() => {
    const sys = getSystemAudioSettings();
    setSelectedVoiceName(sys.voiceName || "");
    setPlaybackSpeed(sys.playbackSpeed || 0.95);
    setRecognitionLang(sys.recognitionLang || "zh-CN");

    const loadVoices = () => {
      setAvailableVoices(getAvailableChineseVoices());
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const onSettingsChanged = (e: any) => {
      const updated: SystemAudioSettings = e.detail || getSystemAudioSettings();
      if (updated.voiceName) setSelectedVoiceName(updated.voiceName);
      if (typeof updated.playbackSpeed === "number") setPlaybackSpeed(updated.playbackSpeed);
      if (updated.recognitionLang) setRecognitionLang(updated.recognitionLang);
    };
    window.addEventListener("aihsk_audio_settings_changed", onSettingsChanged);

    async function fetchTemplates() {
      try {
        setIsLoadingTemplates(true);
        const res = await fetch("/api/hskk/templates");
        const data = await res.json();
        if (data.success && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      } catch (err) {
        console.warn("Failed to load templates:", err);
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    fetchTemplates();

    return () => {
      window.removeEventListener("aihsk_audio_settings_changed", onSettingsChanged);
    };
  }, []);

  const activeTemplate =
    templates.find((t) => t.level === selectedLevel) || templates[1];

  const handleStartExam = async () => {
    if (!activeTemplate || isCreatingSession) return;
    setIsCreatingSession(true);

    try {
      const res = await fetch("/api/hskk/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activeTemplate.id,
          mode: examMode,
        }),
      });
      const data = await res.json();
      if (data.success && data.session?.id) {
        router.push(`/dashboard/hskk/room/${data.session.id}`);
      } else {
        alert(data.error || "Không thể khởi tạo phòng thi HSKK.");
        setIsCreatingSession(false);
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ phòng thi HSKK.");
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto pb-16">
      {/* Page Title & Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-start gap-3.5">
          <BrandLogo size={48} className="rounded-2xl shadow-md mt-1 shrink-0 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs">
                Chuẩn CTI &bull; Hanban 2024
              </Badge>
              <span className="text-xs text-slate-400">Khung Đánh Giá HSK 3.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Phòng Thi Thử HSKK Ảo Chuẩn Quốc Tế
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Mô phỏng trung thực 100% kỳ thi Khẩu ngữ Tiếng Trung trên máy tính (机考). Băng ghi âm câu hỏi chuẩn giọng Bắc Kinh, tín hiệu bíp '嘀' chính thức và Giám khảo AI chấm điểm 7 chiều.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAudioModal(true)}
            className="border-slate-300 dark:border-slate-700 text-xs font-bold h-10 px-3.5 rounded-xl flex items-center gap-1.5"
            title="Cài đặt giọng đọc & âm thanh hệ thống"
          >
            <Settings className="h-4 w-4 text-rose-600" />
            <span>Cài Đặt Âm Thanh</span>
          </Button>

          <Link href="/dashboard/reports">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-xs font-bold h-10 px-4 rounded-xl flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-rose-600" />
              <span>Lịch Sử Báo Cáo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Level Selector Tabs */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          1. Chọn Cấp Độ Thi Khẩu Ngữ HSKK:
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sơ cấp */}
          <div
            onClick={() => setSelectedLevel("HSKK_PRIMARY")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
              selectedLevel === "HSKK_PRIMARY"
                ? "border-rose-600 bg-rose-50/40 dark:bg-rose-950/20 shadow-md"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {selectedLevel === "HSKK_PRIMARY" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
            <Badge variant="secondary" className="text-[10px] mb-2">
              HSK 1 - HSK 2
            </Badge>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              HSKK Sơ Cấp (初级)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              27 câu hỏi &bull; 17 phút &bull; Vốn từ ~200 - 300 từ.
            </p>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 mt-3 space-y-1">
              <li>&bull; Phần 1: Nghe và nhắc lại (15 câu)</li>
              <li>&bull; Phần 2: Nghe và trả lời (10 câu)</li>
              <li>&bull; Phần 3: Trả lời câu hỏi (2 câu)</li>
            </ul>
          </div>

          {/* Trung cấp (Featured) */}
          <div
            onClick={() => setSelectedLevel("HSKK_INTERMEDIATE")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
              selectedLevel === "HSKK_INTERMEDIATE"
                ? "border-rose-600 bg-rose-50/40 dark:bg-rose-950/20 shadow-md"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="absolute -top-2.5 left-5 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              Mục Tiêu Phổ Biến Nhất
            </div>
            {selectedLevel === "HSKK_INTERMEDIATE" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
            <Badge variant="secondary" className="text-[10px] mb-2 mt-1">
              HSK 3 - HSK 4
            </Badge>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              HSKK Trung Cấp (中级)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              14 câu hỏi &bull; 23 phút &bull; Vốn từ ~900 từ vựng.
            </p>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 mt-3 space-y-1">
              <li>&bull; Phần 1: Nghe và nhắc lại (10 câu)</li>
              <li>&bull; Phần 2: Nhìn tranh mô tả (2 bức tranh)</li>
              <li>&bull; Phần 3: Trả lời câu hỏi tình huống (2 câu)</li>
            </ul>
          </div>

          {/* Cao cấp */}
          <div
            onClick={() => setSelectedLevel("HSKK_ADVANCED")}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
              selectedLevel === "HSKK_ADVANCED"
                ? "border-rose-600 bg-rose-50/40 dark:bg-rose-950/20 shadow-md"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {selectedLevel === "HSKK_ADVANCED" && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
            <Badge variant="secondary" className="text-[10px] mb-2">
              HSK 5 - HSK 6
            </Badge>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              HSKK Cao Cấp (高级)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              6 câu hỏi &bull; 25 phút &bull; Vốn từ 3.000+ từ vựng.
            </p>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 mt-3 space-y-1">
              <li>&bull; Phần 1: Nghe thuật lại đoạn văn (3 đoạn)</li>
              <li>&bull; Phần 2: Đọc to đoạn văn chuẩn mực (1 đoạn)</li>
              <li>&bull; Phần 3: Nghị luận &amp; Biện luận xã hội (2 câu)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Candidate Pass & Examination Details Card */}
      {activeTemplate && (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <CardHeader className="p-5 sm:p-6 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandLogo size={36} className="rounded-xl shadow-xs shrink-0" />
                <div>
                  <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider block">
                    Cấu Hình Phòng Khảo Thí Ảo &bull; Classnia AI
                  </span>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeTemplate.title} ({activeTemplate.titleZh})
                  </CardTitle>
                </div>
              </div>

              {/* Exam Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setExamMode("OFFICIAL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    examMode === "OFFICIAL"
                      ? "bg-white dark:bg-slate-900 text-rose-600 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Thi Thật (Thời gian thực)
                </button>
                <button
                  type="button"
                  onClick={() => setExamMode("PRACTICE")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    examMode === "PRACTICE"
                      ? "bg-white dark:bg-slate-900 text-rose-600 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Luyện Tập (Linh hoạt)
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeTemplate.description}
            </p>

            {/* Structure Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Phần Thi</th>
                    <th className="py-2.5 px-4">Tên Phần</th>
                    <th className="py-2.5 px-4">Số Lượng</th>
                    <th className="py-2.5 px-4">Điểm Tối Đa</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Quy Cách Trả Lời</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeTemplate.parts.map((p) => (
                    <tr key={p.partNumber} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                      <td className="py-2.5 px-4 font-mono font-bold text-rose-600">
                        Phần {p.partNumber}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                        {p.nameZh} ({p.nameVi})
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.questionCount} câu
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                        {p.maxScore} điểm
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">
                        {p.guidelines}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 dark:bg-slate-800/40 font-bold">
                    <td colSpan={2} className="py-2.5 px-4 text-slate-900 dark:text-white">
                      Tổng Toàn Bài Thi
                    </td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white">
                      {activeTemplate.totalQuestions} câu
                    </td>
                    <td className="py-2.5 px-4 text-rose-600 dark:text-rose-400 font-black">
                      100 điểm (Đỗ: &ge; 60)
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">
                      Thời lượng: ~{activeTemplate.totalDurationMinutes} phút
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Launch Exam CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  {examMode === "OFFICIAL"
                    ? "Chế độ thi thật: Thu âm tự động sau tiếng 'bíp', hết giờ tự nộp bài."
                    : "Chế độ luyện thi: Cho phép nghe lại câu hỏi và xem gợi ý Pinyin."}
                </span>
              </div>

              <Button
                onClick={handleStartExam}
                disabled={isCreatingSession}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 px-8 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
              >
                {isCreatingSession ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang Chuẩn Bị Phòng Thi...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-5 w-5" />
                    <span>Vào Phòng Thi Ảo Ngay</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Audio Settings Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Settings className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold">Cài Đặt Âm Thanh &amp; Giọng Đọc</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Giọng đọc Giám khảo HSK (TTS):
                </label>
                <select
                  value={FIXED_VOICE_NAME}
                  onChange={() => {
                    setSelectedVoiceName(FIXED_VOICE_NAME);
                    saveSystemAudioSettings({ voiceName: FIXED_VOICE_NAME });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  <option value={FIXED_VOICE_NAME}>
                    {FIXED_VOICE_LABEL}
                  </option>
                </select>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  ✓ Cố định giọng chuẩn khảo thí HSK / HSKK
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Ngôn ngữ nhận diện giọng nói Micro (STT):
                </label>
                <select
                  value={recognitionLang}
                  onChange={(e) => {
                    const lang = e.target.value;
                    setRecognitionLang(lang);
                    saveSystemAudioSettings({ recognitionLang: lang });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="zh-CN">Tiếng Trung Đại Lục (Phổ thông / zh-CN)</option>
                  <option value="zh-TW">Tiếng Trung Chuẩn (Phổ thông / zh-TW)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Tốc độ phát âm câu hỏi:
                </label>
                <div className="flex gap-2">
                  {[0.85, 0.95, 1.05].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        saveSystemAudioSettings({ playbackSpeed: speed });
                      }}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                        playbackSpeed === speed
                          ? "bg-rose-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {speed === 0.85 ? "0.85x (Chậm)" : speed === 0.95 ? "0.95x (Chuẩn)" : "1.05x (Nhanh)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    speakWithSystemSettings("欢迎参加汉语水平口语考试。发音与语速测试正常。", {
                      speedOverride: playbackSpeed,
                      voiceNameOverride: selectedVoiceName,
                    });
                  }}
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs h-9 rounded-xl"
                >
                  <Volume2 className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                  <span>Thử nghe giọng đọc</span>
                </Button>

                <Button
                  onClick={() => setShowAudioModal(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 px-5 rounded-xl"
                >
                  Hoàn tất &amp; Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
