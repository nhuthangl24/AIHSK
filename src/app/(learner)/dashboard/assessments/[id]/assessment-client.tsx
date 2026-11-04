"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SoundWave } from "@/components/ui/sound-wave";
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  Languages,
  Settings,
  ArrowLeft,
  Lightbulb,
  Award,
  Keyboard,
  Send,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface Turn {
  id?: string;
  turnIndex: number;
  stage: number;
  speaker: "EXAMINER" | "LEARNER";
  textContent: string;
  pinyinContent?: string;
  audioUrl?: string;
}

interface SessionData {
  id: string;
  status: string;
  currentStage: number;
  currentTurn: number;
  totalTurns: number;
  template: {
    title: string;
    targetLevel: string;
    stagesConfig: any;
  };
  turns: Turn[];
}

const STAGES = [
  {
    num: 1,
    name: "Khởi động & Chào hỏi",
    zh: "问候导入",
    desc: "Chào hỏi & giới thiệu bản thân",
    tips: "Giới thiệu họ tên, tuổi tác, công việc hoặc lý do học tiếng Trung. Chú ý phát âm chuẩn xác 4 thanh điệu cơ bản.",
    keywords: ["我叫...", "今年...岁", "学习中文...", "因为..."],
  },
  {
    num: 2,
    name: "Giao tiếp đời sống",
    zh: "日常交流",
    desc: "Sở thích & thói quen sinh hoạt",
    tips: "Miêu tả thói quen cuối tuần, món ăn yêu thích hoặc sở thích cá nhân. Sử dụng các liên từ kết nối câu.",
    keywords: ["周末", "平时", "经常", "比如", "跟...一起..."],
  },
  {
    num: 3,
    name: "Thuyết trình chủ đề",
    zh: "主题阐述",
    desc: "Bàn luận chủ đề chuyên sâu",
    tips: "Trình bày quan điểm rõ ràng về chủ đề được nêu. Đưa ra ví dụ cụ thể để minh họa luận điểm của bạn.",
    keywords: ["我认为", "优势", "方便", "但是", "不能完全代替..."],
  },
  {
    num: 4,
    name: "Phản biện & Mở rộng",
    zh: "深入追问",
    desc: "Phản biện & câu hỏi mở rộng",
    tips: "Đề xuất giải pháp cho vấn đề được nêu. Giữ nhịp nói liên tục, hạn chế ngập ngừng quá lâu.",
    keywords: ["针对这个问题", "建议", "平衡", "结合", "其实..."],
  },
  {
    num: 5,
    name: "Tổng kết & Đánh giá",
    zh: "考试总结",
    desc: "Kết thúc & đánh giá tổng thể",
    tips: "Lắng nghe nhận xét tổng kết từ giám khảo và đáp lời chào cảm ơn lịch sự.",
    keywords: ["非常感谢", "谢谢考官", "收获很多", "再见"],
  },
];

const getQuestionHint = (stage: number, text: string, topic?: string): string => {
  const t = topic || "chủ đề khảo thí";
  if (stage === 1) {
    if (text.includes("准备好了吗") || text.includes("介绍一下自己") || text.includes("自我介绍")) {
      return "💡 Gợi ý Chặng 1: Giới thiệu họ tên, quê quán, công việc hoặc học tập và bạn đã học tiếng Trung được bao lâu.";
    }
    return `💡 Gợi ý Chặng 1: Chia sẻ lý do bạn học tiếng Trung và ấn tượng ban đầu của bạn về chủ đề "${t}".`;
  }
  if (stage === 2) {
    if (text.includes("经历") || text.includes("最近") || text.includes("分享") || text.includes("难忘")) {
      return `💡 Gợi ý Chặng 2: Kể lại một trải nghiệm thực tế hoặc kỷ niệm cụ thể của bạn liên quan đến "${t}" (sử dụng từ nối thời gian: 最近, 有一次, 后来...).`;
    }
    return `💡 Gợi ý Chặng 2: Chia sẻ các thói quen sinh hoạt hoặc sở thích hàng ngày của bạn gắn liền với "${t}".`;
  }
  if (stage === 3) {
    if (text.includes("长远") || text.includes("对比") || text.includes("影响") || text.includes("优缺点")) {
      return `💡 Gợi ý Chặng 3: Phân tích so sánh hai mặt ưu/nhược điểm hoặc ảnh hưởng sâu rộng của "${t}" (dùng liên từ: 从长远来看, 一方面...另一方面...).`;
    }
    return `💡 Gợi ý Chặng 3: Nêu rõ quan điểm chính của bạn về "${t}" cùng 2 lý do và ví dụ thực tế minh họa.`;
  }
  if (stage === 4) {
    if (text.includes("建议") || text.includes("办法") || text.includes("解决")) {
      return `💡 Gợi ý Chặng 4: Đề xuất 2 lời khuyên hữu ích hoặc giải pháp thiết thực để giải quyết vấn đề được nêu.`;
    }
    return `💡 Gợi ý Chặng 4: Đưa ra lập luận bảo vệ quan điểm hoặc cách bạn xử lý tình huống giả định khó khăn được đặt ra.`;
  }
  if (stage === 5) {
    if (text.includes("发挥") || text.includes("回顾") || text.includes("满意")) {
      return "💡 Gợi ý Chặng 5: Chia sẻ cảm nhận thật của bạn về bài thi hôm nay (hài lòng về sự tự tin, phát âm, từ vựng hay muốn tiếp tục cải thiện điểm nào).";
    }
    return "💡 Gợi ý Chặng 5: Lắng nghe lời nhận xét chúc mừng từ giám khảo và đáp lời cảm ơn lịch sự để hoàn tất bài thi.";
  }
  return "💡 Gợi ý: Hãy trả lời tự nhiên, phát âm rõ ràng, tập trung vào câu hỏi của giám khảo.";
};

export default function AssessmentExamRoomClient({ sessionId }: { sessionId?: string }) {
  const router = useRouter();
  const routeParams = useParams();
  const id = sessionId || (routeParams?.id as string) || "";

  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voice & Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [learnerTranscript, setLearnerTranscript] = useState("");
  const [showPinyin, setShowPinyin] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("Google 國語（臺灣）");
  const [recognitionLang, setRecognitionLang] = useState<string>("zh-TW");

  // Modals & Panels
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showRubricDrawer, setShowRubricDrawer] = useState(false);

  // Audio References
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Voices for TTS
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const zhVoices = voices.filter(
        (v) =>
          v.lang.startsWith("zh") ||
          v.lang.includes("cmn") ||
          v.lang.includes("Chinese") ||
          v.name.includes("Chinese") ||
          v.name.includes("Taiwan") ||
          v.name.includes("Mandarin")
      );
      setAvailableVoices(zhVoices);

      const preferred =
        zhVoices.find((v) => v.name.includes("Google") && v.name.includes("國語")) ||
        zhVoices.find((v) => v.lang === "zh-TW") ||
        zhVoices.find((v) => v.lang === "zh-CN") ||
        zhVoices[0];

      if (preferred) {
        setSelectedVoiceName(preferred.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch Session Data
  const fetchSession = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/assessments/${id}`);
      if (!res.ok) {
        throw new Error("Không thể tải thông tin phòng thi.");
      }
      const data = await res.json();
      setSession(data.session);

      if (data.session.status === "COMPLETED") {
        router.push(`/dashboard/reports/${id}`);
        return;
      }

      if (data.session.status === "PROCESSING") {
        setIsFinalizing(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/assessments/${id}`);
            if (!pollRes.ok) return;
            const pollData = await pollRes.json();
            if (pollData?.session?.status === "COMPLETED") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              router.push(`/dashboard/reports/${id}`);
            }
          } catch (e) {
            console.error("Poll error:", e);
          }
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tải thông tin phiên kiểm tra.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  // Auto-scroll chat to bottom smoothly
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [session?.turns, isRecording, learnerTranscript, isExaminerSpeaking]);

  // Examiner Voice TTS
  const speakExaminerText = (text: string, speedOverride?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsExaminerSpeaking(false);

    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, "")
      .replace(/[\(\[（【].*?[\)\]）】]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = recognitionLang;
    utterance.rate = speedOverride || playbackSpeed;
    utterance.pitch = 1.0;

    if (availableVoices.length > 0) {
      const match = availableVoices.find((v) => v.name === selectedVoiceName);
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      setIsExaminerSpeaking(true);
    };

    utterance.onend = () => {
      setIsExaminerSpeaking(false);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      console.warn("TTS playback note:", e);
      setIsExaminerSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopExaminerVoice = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsExaminerSpeaking(false);
    currentUtteranceRef.current = null;
  };

  // Auto-speak latest question on turn change
  useEffect(() => {
    if (!session || session.turns.length === 0) return;
    const latestTurn = session.turns[session.turns.length - 1];
    if (latestTurn.speaker === "EXAMINER") {
      speakExaminerText(latestTurn.textContent);
    }
  }, [session?.turns.length]);

  // Speech Recognition Start/Stop
  const startRecording = () => {
    if (typeof window === "undefined") return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsExaminerSpeaking(false);
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Trình duyệt chưa hỗ trợ Web Speech Recognition tự động. Đã chuyển sang chế độ gõ văn bản để bạn nhập câu trả lời."
      );
      setInputMode("text");
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = recognitionLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setLearnerTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  // Submit Spoken Learner Turn
  const handleSubmitTurn = async () => {
    if (!learnerTranscript.trim() || isSubmittingTurn) return;

    if (session?.status === "PROCESSING" || session?.status === "COMPLETED" || isFinalizing) {
      setIsFinalizing(true);
      return;
    }

    stopRecording();
    setIsSubmittingTurn(true);

    const actualDurationMs = Math.max(recordingSeconds * 1000, 8000);

    try {
      const res = await fetch(`/api/assessments/${id}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: learnerTranscript.trim(),
          durationMs: actualDurationMs,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Gửi câu trả lời thất bại (mã phản hồi ${res.status}). Vui lòng thử lại.`);
      }

      setLearnerTranscript("");
      setRecordingSeconds(0);
      setShowHint(false);

      if (data?.isCompleted) {
        setIsFinalizing(true);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/assessments/${id}`);
            if (!pollRes.ok) return;
            const pollData = await pollRes.json();
            if (pollData?.session?.status === "COMPLETED") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              router.push(`/dashboard/reports/${id}`);
            }
          } catch (e) {
            console.error("Poll error:", e);
          }
        }, 1500);
      } else {
        await fetchSession();
      }
    } catch (err: any) {
      console.error("Turn submission error:", err);
      const friendlyMsg =
        err?.message?.includes("<!DOCTYPE") || err?.message?.includes("JSON")
          ? "Máy chủ đang xử lý hoặc kết nối bị gián đoạn. Vui lòng bấm gửi lại."
          : (err?.message || "Không thể gửi câu trả lời. Vui lòng thử lại.");
      alert(friendlyMsg);
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  // Test voice sample in modal
  const handleTestVoiceSample = () => {
    if (isExaminerSpeaking) {
      stopExaminerVoice();
    } else {
      speakExaminerText("你好！我是考官李老师，很高兴为你提供华语口语评估服务。");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-rose-100 dark:border-rose-950/60 border-t-rose-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-rose-600 font-bold text-lg font-serif">
            李
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Đang vào phòng thi khẩu ngữ...
          </h3>
          <p className="text-xs text-slate-500">Khởi tạo phòng khảo thí Giám khảo AI</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-center space-y-5 shadow-xl">
          <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Không thể tải phòng thi
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {error || "Phiên kiểm tra không tồn tại hoặc đã kết thúc."}
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/assessments")}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
          >
            Quay lại danh sách bài thi
          </Button>
        </div>
      </div>
    );
  }

  const currentStageInfo = STAGES.find((s) => s.num === session.currentStage) || STAGES[0];
  const stagePercent = Math.round((session.currentStage / 5) * 100);

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-40 flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none m-0 p-0">
      {/* ====================================================================== */}
      {/* 1. TOP HEADER BAR (Compact, responsive, zero collision)               */}
      {/* ====================================================================== */}
      <header className="h-14 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
        {/* Left: Exit + Level badge + Exam title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white h-8 px-2 sm:px-2.5 rounded-lg -ml-1 text-xs shrink-0"
            title="Thoát phòng thi"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Thoát</span>
          </Button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <span className="inline-flex items-center bg-rose-600 text-white font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md shrink-0 shadow-xs">
            {session.template.targetLevel}
          </span>

          <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-xs md:max-w-md">
            {session.template.title}
          </h1>

          <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-900/50 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Đang thi trực tiếp
          </span>
        </div>

        {/* Right Controls: Timer + Status + Tips + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60">
            <Clock className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span className="font-mono text-xs">{formatDuration(elapsedSeconds)}</span>
          </div>

          {/* Examiner Speaking / Stop Voice Button */}
          {isExaminerSpeaking && (
            <button
              type="button"
              onClick={stopExaminerVoice}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all shadow-xs"
              title="Dừng phát giọng đọc (Esc)"
            >
              <Square className="h-2.5 w-2.5 fill-current animate-pulse" />
              <span className="hidden sm:inline">Dừng đọc</span>
            </button>
          )}

          {/* Rubric Drawer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRubricDrawer(true)}
            className="h-8 px-2 sm:px-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/40 rounded-lg gap-1.5"
            title="Xem tiêu chí chấm điểm và mẹo chặng thi"
          >
            <Award className="h-3.5 w-3.5 text-rose-600" />
            <span className="hidden md:inline">Mẹo & Tiêu chí</span>
          </Button>

          {/* Audio Config Modal */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAudioModal(true)}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
            title="Cài đặt âm thanh và giọng đọc"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ====================================================================== */}
      {/* 2. 5-STAGE PROGRESS BAR (Mobile: sleek progress | Desktop: stepper)    */}
      {/* ====================================================================== */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 shrink-0 z-10">
        {/* Mobile View: Clean single-line stage banner with progress bar */}
        <div className="flex md:hidden flex-col px-3 py-1.5 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300 truncate">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white text-[9px]">
                {currentStageInfo.num}
              </span>
              <span className="truncate">{currentStageInfo.name}</span>
              <span className="text-slate-400 font-normal">({currentStageInfo.zh})</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 shrink-0 ml-2">
              Chặng {session.currentStage}/5 &bull; {stagePercent}%
            </span>
          </div>
          {/* Visual progress bar line */}
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-600 transition-all duration-500 rounded-full"
              style={{ width: `${stagePercent}%` }}
            />
          </div>
        </div>

        {/* Desktop View: Elegant 5-Stage Stepper Deck */}
        <div className="hidden md:flex items-center justify-between gap-2 max-w-4xl mx-auto px-4 py-2">
          {STAGES.map((st) => {
            const isCurrent = session.currentStage === st.num;
            const isPassed = session.currentStage > st.num;

            return (
              <div
                key={st.num}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  isCurrent
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/60 shadow-2xs"
                    : isPassed
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                    isPassed
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {isPassed ? <Check className="h-2.5 w-2.5" /> : st.num}
                </span>
                <span className="truncate">{st.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. MAIN CONVERSATION STREAM (Focused studio layout, no empty void)     */}
      {/* ====================================================================== */}
      <main
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 max-w-3xl w-full mx-auto"
      >
        {/* Examiner Studio Greeting Card at top (Grounds the page at Start) */}
        <div className="rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200/60 dark:border-rose-900/40 p-3.5 sm:p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center font-bold text-base font-serif shadow-sm shrink-0">
            李
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Giám khảo AI Lý Lão Sư (考官李老师)
              </h2>
              <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/80 px-2 py-0.5 rounded-full">
                Khảo thí khẩu ngữ HSK thích ứng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Lắng nghe câu hỏi và bấm Micro bên dưới để trả lời bằng tiếng Trung.
            </p>
          </div>
        </div>

        {/* Conversation Turns List */}
        {session.turns.map((turn, i) => {
          const isExaminer = turn.speaker === "EXAMINER";
          const isLatest = i === session.turns.length - 1;
          const isFirstInStage = i === 0 || session.turns[i - 1]?.stage !== turn.stage;

          return (
            <div key={turn.id || i} className="space-y-3">
              {/* Stage Transition Divider */}
              {isFirstInStage && (
                <div className="flex items-center justify-center my-3 sm:my-4">
                  <span className="px-3.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase border border-slate-300/60 dark:border-slate-700/60 shadow-2xs">
                    Chặng {turn.stage} &bull; {STAGES.find((s) => s.num === turn.stage)?.name} ({STAGES.find((s) => s.num === turn.stage)?.zh})
                  </span>
                </div>
              )}

              {/* Examiner Bubble */}
              {isExaminer ? (
                <div className="flex items-start gap-2.5 sm:gap-3.5 max-w-[96%] sm:max-w-[90%]">
                  {/* Examiner Avatar */}
                  <div className="relative shrink-0 mt-1">
                    <div
                      className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center font-bold text-sm font-serif transition-all ${
                        isLatest && isExaminerSpeaking
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400"
                          : "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                      }`}
                    >
                      李
                    </div>
                    {isLatest && isExaminerSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
                      </span>
                    )}
                  </div>

                  {/* Examiner Card Body */}
                  <div
                    className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 flex-1 ${
                      isLatest
                        ? "bg-white dark:bg-slate-900 border-2 border-rose-500/80 ring-4 ring-rose-500/5"
                        : "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 opacity-95"
                    }`}
                  >
                    {/* Card Header Toolbar (Responsive & Clean) */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          Giám khảo Lý
                        </span>
                        {isLatest && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50 shrink-0">
                            Câu hỏi hiện tại
                          </span>
                        )}
                      </div>

                      {/* Controls: Speed, Pinyin Toggle, Audio Playback */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isLatest && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.05 : 0.95;
                              setPlaybackSpeed(next);
                              speakExaminerText(turn.textContent, next);
                            }}
                            className="h-6 px-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-md transition-colors"
                            title="Tốc độ đọc câu hỏi"
                          >
                            {playbackSpeed}x
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowPinyin(!showPinyin)}
                          className="h-6 px-2 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                          title="Bật/Tắt phiên âm Pinyin"
                        >
                          <Languages className="h-3 w-3" />
                          <span>{showPinyin ? "Ẩn Pinyin" : "Pinyin"}</span>
                        </button>

                        {isLatest && isExaminerSpeaking ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopExaminerVoice}
                            className="h-6 px-2 text-[10px] sm:text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md gap-1 animate-pulse"
                            title="Dừng phát giọng (Esc)"
                          >
                            <Square className="h-2.5 w-2.5 fill-current" />
                            <span>Dừng</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakExaminerText(turn.textContent)}
                            className="h-6 px-2 text-[10px] sm:text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md gap-1"
                            title="Nghe lại câu hỏi"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>Nghe lại</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Question Hanzi text */}
                    <p
                      className={`font-bold text-slate-900 dark:text-white leading-relaxed tracking-wide ${
                        isLatest ? "text-lg sm:text-xl md:text-2xl" : "text-sm sm:text-base"
                      }`}
                    >
                      {turn.textContent}
                    </p>

                    {/* Pinyin transcription */}
                    {showPinyin && turn.pinyinContent && (
                      <p className="text-xs sm:text-sm text-rose-600/90 dark:text-rose-400 font-sans tracking-wide leading-relaxed pt-0.5">
                        {turn.pinyinContent}
                      </p>
                    )}

                    {/* Hint Accordion for active question */}
                    {isLatest && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowHint(!showHint)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          <span>{showHint ? "Ẩn gợi ý câu trả lời" : "Gợi ý trả lời & từ khóa"}</span>
                          {showHint ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        {showHint && (
                          <div className="mt-2 p-3 sm:p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 leading-relaxed animate-in fade-in">
                            <p>{getQuestionHint(session.currentStage, turn.textContent, session.template.title)}</p>
                            <div className="mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex flex-wrap gap-1.5">
                              {currentStageInfo.keywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white/80 dark:bg-slate-900 text-amber-900 dark:text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-amber-300/50"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio wave indicator when examiner is talking */}
                    {isLatest && isExaminerSpeaking && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <span className="font-medium text-rose-600">Giám khảo đang đọc câu hỏi...</span>
                        <SoundWave isActive={true} color="cinnabar" size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Learner Turn Bubble (Right Aligned) */
                <div className="flex flex-col items-end space-y-1 ml-auto max-w-[94%] sm:max-w-[85%]">
                  <span className="text-[10px] font-semibold text-slate-400 px-1">
                    Thí sinh (Bạn)
                  </span>
                  <div className="rounded-2xl rounded-tr-xs p-3.5 sm:p-4 bg-rose-600 text-white shadow-xs">
                    <p className="font-medium text-sm sm:text-base leading-relaxed tracking-wide">
                      {turn.textContent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Subtitle when Candidate is speaking */}
        {isRecording && learnerTranscript && (
          <div className="flex flex-col items-end space-y-1 ml-auto max-w-[94%] sm:max-w-[85%] animate-in fade-in">
            <span className="text-[10px] font-semibold text-rose-600 animate-pulse flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              Đang nhận diện giọng nói trực tiếp...
            </span>
            <div className="rounded-2xl rounded-tr-xs p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-2 border-rose-400 dark:border-rose-800 italic">
              <p className="text-sm font-medium">{learnerTranscript}</p>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================== */}
      {/* 4. BOTTOM RESPONSE DOCK (Tactile, Ergonomic, Mobile-First)             */}
      {/* ====================================================================== */}
      <footer className="shrink-0 border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 z-20 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Active Voice Mode Console */}
          {inputMode === "voice" ? (
            <div className="space-y-2.5">
              {/* If transcript exists, show review/confirmation box */}
              {learnerTranscript && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-3 sm:p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-900 dark:text-rose-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                      Câu trả lời của bạn:
                    </span>
                    <button
                      type="button"
                      onClick={() => setLearnerTranscript("")}
                      className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Xóa câu này</span>
                    </button>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {learnerTranscript}
                  </p>
                </div>
              )}

              {/* Action Buttons Row in Voice Mode */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Big Microphone Action Button */}
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={isSubmittingTurn || isExaminerSpeaking || isFinalizing || session?.status === "PROCESSING"}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{learnerTranscript ? "Nói thêm vào câu trả lời" : "Bấm để bắt đầu nói (开始录音)"}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm h-11 sm:h-12 rounded-2xl flex items-center justify-center gap-2 shadow-sm animate-pulse transition-all"
                  >
                    <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Hoàn tất nói ({recordingSeconds}s) &bull; Dừng thu</span>
                  </Button>
                )}

                {/* Submit button (if transcript is captured) */}
                {learnerTranscript && !isRecording && (
                  <Button
                    onClick={handleSubmitTurn}
                    disabled={isSubmittingTurn || isFinalizing}
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 font-bold text-xs sm:text-sm h-11 sm:h-12 px-5 sm:px-6 rounded-2xl flex items-center justify-center gap-2 shadow-sm shrink-0 transition-all"
                  >
                    {isSubmittingTurn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <span>Gửi câu trả lời (提交)</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                )}

                {/* Keyboard input toggle button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputMode("text");
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  className="h-11 sm:h-12 px-3 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shrink-0"
                  title="Chuyển sang gõ chữ bằng bàn phím"
                >
                  <Keyboard className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Gõ phím</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Active Keyboard Typing Mode */
            <div className="space-y-2">
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 p-3 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <textarea
                  ref={textareaRef}
                  value={learnerTranscript}
                  onChange={(e) => setLearnerTranscript(e.target.value)}
                  disabled={isSubmittingTurn || isFinalizing || session?.status === "PROCESSING"}
                  placeholder="Gõ câu trả lời bằng tiếng Trung tại đây (hoặc dùng bộ gõ Pinyin)..."
                  rows={2}
                  className="w-full border-0 bg-transparent p-0 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-medium disabled:opacity-60 max-h-20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitTurn();
                    }
                  }}
                />
              </div>

              {/* Text Mode Action Toolbar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInputMode("voice")}
                    className="h-9 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl gap-1"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>Dùng Micro nói</span>
                  </Button>

                  {learnerTranscript && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLearnerTranscript("")}
                      className="h-9 px-2 text-xs text-slate-400 hover:text-slate-700 rounded-xl"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleSubmitTurn}
                  disabled={!learnerTranscript.trim() || isSubmittingTurn || isFinalizing}
                  className={`h-9 px-4 sm:px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    learnerTranscript.trim()
                      ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 shadow-xs"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                  }`}
                >
                  {isSubmittingTurn ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <span>Gửi câu trả lời (提交)</span>
                      <Send className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* ====================================================================== */}
      {/* 5. SLIDE-OVER DRAWER: RUBRIC & STAGE TIPS                              */}
      {/* ====================================================================== */}
      {showRubricDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-5 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Mẹo Thi & Tiêu Chí Chấm Điểm HSK
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRubricDrawer(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs leading-relaxed">
              {/* Current Stage Guidance */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-200">
                  <Lightbulb className="h-4 w-4 text-rose-600" />
                  <span>Chặng {currentStageInfo.num}: {currentStageInfo.name}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {currentStageInfo.tips}
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block mb-1.5">
                    Từ vựng gợi ý nên dùng:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStageInfo.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/40"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rubric dimensions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  4 Tiêu Chuẩn Đánh Giá Trọng Yếu
                </span>
                <div className="space-y-2">
                  {[
                    {
                      title: "1. Phát âm & Thanh điệu (发音与声调)",
                      desc: "Chuẩn xác 4 thanh điệu tiếng Trung, biến điệu '一', '不' và thanh nhẹ.",
                    },
                    {
                      title: "2. Độ trôi chảy & Lưu loát (流利度)",
                      desc: "Tốc độ nói ổn định, ngắt nghỉ đúng cụm ngữ nghĩa, hạn chế ngập ngừng kéo dài.",
                    },
                    {
                      title: "3. Từ vựng & Ngữ pháp (词汇与语法)",
                      desc: "Vận dụng tốt từ vựng cấp độ tương ứng và các mẫu câu liên kết câu.",
                    },
                    {
                      title: "4. Độ phản xạ & Trọng tâm (应答切题)",
                      desc: "Trả lời đúng trọng tâm câu hỏi của giám khảo và có mở rộng thông tin.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowRubricDrawer(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-10 rounded-xl font-semibold"
            >
              Đã hiểu, quay lại phòng thi
            </Button>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. AUDIO SETTINGS MODAL                                                */}
      {/* ====================================================================== */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cài đặt âm thanh & Giọng đọc
                  </h3>
                  <p className="text-xs text-slate-500">Giọng giám khảo & Ngôn ngữ nhận diện</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAudioModal(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Giọng đọc Giám khảo AI:
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Ngôn ngữ nhận diện micro (STT):
                </label>
                <select
                  value={recognitionLang}
                  onChange={(e) => setRecognitionLang(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="zh-TW">Tiếng Trung Chuẩn (Phổ thông / zh-TW)</option>
                  <option value="zh-CN">Tiếng Trung Đại Lục (Phổ thông / zh-CN)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestVoiceSample}
                  className="text-xs h-8 rounded-lg"
                >
                  {isExaminerSpeaking ? "Dừng thử giọng" : "Thử nghe giọng đọc"}
                </Button>
                <Button
                  onClick={() => setShowAudioModal(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs h-8 px-4 font-semibold"
                >
                  Hoàn tất
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 7. EXIT CONFIRMATION MODAL                                             */}
      {/* ====================================================================== */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-4 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rời khỏi phòng thi?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bài thi đang ở Chặng {session.currentStage}. Bạn có thể quay lại tiếp tục bất kỳ lúc nào từ Bảng Điều Khiển.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="text-xs h-10 rounded-xl font-semibold"
              >
                Ở lại
              </Button>
              <Button
                onClick={() => router.push("/dashboard/assessments")}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-10 rounded-xl font-semibold"
              >
                Xác nhận thoát
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 8. FINALIZING OVERLAY MODAL (Scoring progress)                         */}
      {/* ====================================================================== */}
      {isFinalizing && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 m-0">
          <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center space-y-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/80 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Hoàn thành buổi thi khẩu ngữ!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống đánh giá đa chiều đang phân tích toàn bộ 5 giai đoạn hội thoại của bạn...
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2.5 text-left border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Hoàn tất ghi nhận bản hội thoại (Transcript)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Trích xuất ngữ điệu & độ chuẩn phát âm Pinyin</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                <span>Đang khởi tạo báo cáo chẩn đoán chi tiết...</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => router.push(`/dashboard/reports/${id}`)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs h-10 rounded-xl font-semibold gap-2 shadow-sm"
              >
                <span>Xem Báo Cáo Đánh Giá Ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
