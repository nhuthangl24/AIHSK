"use client";

import { useEffect, useState, useRef } from "react";
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
  stopSystemSpeech,
  SystemAudioSettings,
  FIXED_VOICE_NAME,
  FIXED_VOICE_LABEL,
} from "@/lib/audio/system-audio-settings";
import { WavRecorder } from "@/lib/audio/wav-recorder";

export default function HskkPortalPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<HskkExamTemplate[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<HskkLevel>("HSKK_INTERMEDIATE");
  const [examMode, setExamMode] = useState<"OFFICIAL" | "PRACTICE">("OFFICIAL");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Quick Voice Tester with Gemini 3.6 Flash
  const [showQuickTestModal, setShowQuickTestModal] = useState(false);
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);
  const [isEvaluatingSpeech, setIsEvaluatingSpeech] = useState(false);
  const [quickTestSentence, setQuickTestSentence] = useState("我想去图书馆借一本书。");
  const [quickTestResult, setQuickTestResult] = useState<any>(null);
  const [quickTestError, setQuickTestError] = useState<string | null>(null);
  const [quickAudioUrl, setQuickAudioUrl] = useState<string | null>(null);

  // Audio recorder refs
  const quickRecorderRef = useRef<WavRecorder | null>(null);
  const quickStreamRef = useRef<MediaStream | null>(null);

  // System Audio Settings
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(0.95);
  const [recognitionLang, setRecognitionLang] = useState("zh-TW");

  useEffect(() => {
    let isMounted = true;
    const sys = getSystemAudioSettings();
    setSelectedVoiceName(FIXED_VOICE_NAME);
    setPlaybackSpeed(sys.playbackSpeed || 0.95);
    setRecognitionLang(sys.recognitionLang || "zh-TW");

    const loadVoices = () => {
      if (isMounted) setAvailableVoices(getAvailableChineseVoices());
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }

    const onSettingsChanged = (e: any) => {
      if (!isMounted) return;
      const updated: SystemAudioSettings = e.detail || getSystemAudioSettings();
      setSelectedVoiceName(FIXED_VOICE_NAME);
      if (typeof updated.playbackSpeed === "number") setPlaybackSpeed(updated.playbackSpeed);
      if (updated.recognitionLang) setRecognitionLang(updated.recognitionLang);
    };
    window.addEventListener("aihsk_audio_settings_changed", onSettingsChanged);

    async function fetchTemplates() {
      try {
        setIsLoadingTemplates(true);
        const res = await fetch("/api/hskk/templates");
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      } catch (err) {
        console.warn("Failed to load templates:", err);
      } finally {
        if (isMounted) setIsLoadingTemplates(false);
      }
    }
    fetchTemplates();

    return () => {
      isMounted = false;
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      }
      window.removeEventListener("aihsk_audio_settings_changed", onSettingsChanged);
      try {
        stopSystemSpeech();
      } catch {}
    };
  }, []);

  const activeTemplate =
    templates.find((t) => t.level === selectedLevel) || templates[1];

  const handleStartQuickRecord = async () => {
    try {
      setQuickTestError(null);
      setQuickTestResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      quickStreamRef.current = stream;

      const recorder = new WavRecorder();
      quickRecorderRef.current = recorder;
      recorder.start(stream, 16000);
      setIsTestingSpeech(true);
    } catch (e: any) {
      setQuickTestError("Không thể truy cập Micro. Vui lòng cấp quyền micro cho trình duyệt.");
      setIsTestingSpeech(false);
    }
  };

  const handleStopQuickRecord = async () => {
    if (!quickRecorderRef.current) return;
    setIsTestingSpeech(false);
    setIsEvaluatingSpeech(true);

    try {
      const rec = await quickRecorderRef.current.stop();
      if (quickStreamRef.current) {
        quickStreamRef.current.getTracks().forEach((t) => t.stop());
        quickStreamRef.current = null;
      }

      if (!rec?.base64) {
        setQuickTestError("Không thu được âm thanh. Vui lòng thử nói to hơn.");
        setIsEvaluatingSpeech(false);
        return;
      }

      const objUrl = URL.createObjectURL(rec.blob);
      setQuickAudioUrl(objUrl);

      const res = await fetch("/api/hskk/test-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: rec.base64,
          targetText: quickTestSentence,
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setQuickTestResult(data.evaluation);
      } else {
        setQuickTestError(data.error || "Chấm điểm âm thanh thất bại.");
      }
    } catch (err: any) {
      setQuickTestError(err.message || "Lỗi kiểm tra âm thanh.");
    } finally {
      setIsEvaluatingSpeech(false);
    }
  };

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
        try {
          localStorage.setItem(`aihsk_hskk_sess_${data.session.id}`, JSON.stringify(data.session));
        } catch {}
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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => {
              setQuickTestError(null);
              setQuickTestResult(null);
              setShowQuickTestModal(true);
            }}
            className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs h-10 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-950/20"
            title="Thử ghi âm & chấm điểm phát âm trực tiếp với Gemini 3.6 Flash"
          >
            <Mic className="h-4 w-4" />
            <span>🎙️ Test Giọng Gemini 3.6 Flash</span>
          </Button>

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

            {/* Mobile Parts Cards (Clean, readable, zero horizontal overflow) */}
            <div className="space-y-2.5 sm:hidden">
              {activeTemplate.parts.map((p) => (
                <div
                  key={p.partNumber}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                      Phần {p.partNumber}: {p.nameZh}
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {p.maxScore} điểm
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {p.nameVi} ({p.questionCount} câu)
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {p.guidelines}
                  </p>
                </div>
              ))}
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                <span>Tổng Toàn Bài: {activeTemplate.totalQuestions} câu</span>
                <span>100 điểm (&ge;60 là Đạt)</span>
              </div>
            </div>

            {/* Desktop & Tablet Structure Table */}
            <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Phần Thi</th>
                    <th className="py-2.5 px-4">Tên Phần</th>
                    <th className="py-2.5 px-4">Số Lượng</th>
                    <th className="py-2.5 px-4">Điểm Tối Đa</th>
                    <th className="py-2.5 px-4">Quy Cách Trả Lời</th>
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
                      <td className="py-2.5 px-4 text-slate-500">
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
                    <td className="py-2.5 px-4 text-slate-500">
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

      {/* ===================================================================== */}
      {/* MODAL 2: QUICK VOICE TESTER (Gemini 3.6 Flash Multimodal Audio)       */}
      {/* ===================================================================== */}
      {showQuickTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <span>Thử Giọng Nói Với Gemini 3.6 Flash</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Nghe trực tiếp âm thanh từ micro &bull; Phân tích 4 thanh điệu chuẩn CTI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isTestingSpeech && quickRecorderRef.current) {
                    quickRecorderRef.current.stop();
                    setIsTestingSpeech(false);
                  }
                  setShowQuickTestModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Sentence Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Chọn hoặc nhập câu tiếng Trung muốn thử phát âm:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickTestSentence}
                  onChange={(e) => setQuickTestSentence(e.target.value)}
                  placeholder="Nhập câu tiếng Trung..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    speakWithSystemSettings(quickTestSentence, {
                      speedOverride: playbackSpeed,
                      voiceNameOverride: selectedVoiceName,
                    });
                  }}
                  className="border-slate-300 dark:border-slate-700 text-xs px-3 h-10 rounded-xl shrink-0"
                  title="Nghe phát âm mẫu"
                >
                  <Volume2 className="h-4 w-4 text-blue-500" />
                </Button>
              </div>

              {/* Preset Quick Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "我想去图书馆借一本书。",
                  "星期六下午我们一起去看电影吧。",
                  "祝你生日快乐，身体健康！",
                  "这道菜虽然有点儿辣，但是很好吃。",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuickTestSentence(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      quickTestSentence === preset
                        ? "bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:border-rose-700 dark:text-rose-300 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center space-y-3">
              {isEvaluatingSpeech ? (
                <div className="py-4 space-y-2">
                  <Loader2 className="h-8 w-8 text-rose-600 mx-auto animate-spin" />
                  <p className="text-xs font-bold text-rose-600 animate-pulse">
                    Gemini 3.6 Flash đang nghe &amp; phân tích phổ âm thanh...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Đối chiếu cao độ F0, thanh 1-4, biến điệu 3-3 và thanh mẫu...
                  </p>
                </div>
              ) : isTestingSpeech ? (
                <div className="py-2 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Đang ghi âm PCM 16kHz... Hãy nói to, rõ ràng!</span>
                  </div>

                  <div>
                    <Button
                      type="button"
                      onClick={handleStopQuickRecord}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-lg shadow-emerald-950/30 flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Dừng &amp; Chấm Điểm Ngay</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-2 space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bấm nút bên dưới, đọc to câu trên vào micro của bạn:
                  </p>
                  <Button
                    type="button"
                    onClick={handleStartQuickRecord}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-md shadow-rose-950/20 flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Bắt Đầu Thu Âm</span>
                  </Button>
                </div>
              )}

              {quickTestError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 text-left">
                  {quickTestError}
                </div>
              )}
            </div>

            {/* Quick Test Results Card */}
            {quickTestResult && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px] font-bold">
                        Thanh điệu: {quickTestResult.tonesAccuracyScore || 90}%
                      </Badge>
                      <Badge className="bg-sky-950 text-sky-300 border-sky-800 text-[10px] font-bold">
                        Lưu loát: {quickTestResult.fluencyScore || 90}%
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                        {quickTestResult.pronunciationQuality}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Điểm giám khảo CTI: <strong className="text-white text-sm">{quickTestResult.score}/5</strong>
                    </span>
                  </div>

                  {quickAudioUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const audio = new Audio(quickAudioUrl);
                        audio.play();
                      }}
                      className="border-slate-700 bg-slate-800 text-xs text-slate-300 hover:text-white h-8 px-2.5 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-rose-400" />
                      <span>Nghe lại</span>
                    </Button>
                  )}
                </div>

                {/* Recognized Transcript from Audio */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    AI nghe được từ giọng của bạn:
                  </span>
                  <p className="font-semibold text-emerald-300 text-sm">
                    {quickTestResult.recognizedTranscript || "—"}
                  </p>
                  {quickTestResult.pinyinWithTones && (
                    <p className="font-mono text-[11px] text-slate-400">
                      {quickTestResult.pinyinWithTones}
                    </p>
                  )}
                </div>

                {/* Phonetics Breakdown */}
                {quickTestResult.phoneticsAnalysis && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5 text-slate-300">
                    {quickTestResult.phoneticsAnalysis.tonesComment && (
                      <div className="text-[11px]">
                        <strong className="text-emerald-400">Thanh điệu (声调):</strong>{" "}
                        {quickTestResult.phoneticsAnalysis.tonesComment}
                      </div>
                    )}
                    {quickTestResult.phoneticsAnalysis.initialsAndFinalsComment && (
                      <div className="text-[11px]">
                        <strong className="text-sky-400">Phụ âm / Vần:</strong>{" "}
                        {quickTestResult.phoneticsAnalysis.initialsAndFinalsComment}
                      </div>
                    )}
                    {quickTestResult.phoneticsAnalysis.pauseAndFluencyComment && (
                      <div className="text-[11px]">
                        <strong className="text-amber-300">Ngắt nghỉ &amp; Lưu loát:</strong>{" "}
                        {quickTestResult.phoneticsAnalysis.pauseAndFluencyComment}
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {quickTestResult.feedback && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Nhận xét:</strong> {quickTestResult.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
