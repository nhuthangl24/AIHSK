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
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
  Lightbulb,
  Award,
  BookOpen,
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
    tips: "Giới thiệu tên, tuổi, lý do học tiếng Trung. Chú ý phát âm chuẩn 4 thanh điệu cơ bản.",
    keywords: ["我叫...", "今年...岁", "学习中文...", "因为..."],
  },
  {
    num: 2,
    name: "Giao tiếp đời sống",
    zh: "日常交流",
    desc: "Sở thích & thói quen sinh hoạt",
    tips: "Miêu tả thói quen cuối tuần hoặc sở thích cá nhân. Sử dụng câu đầy đủ có liên từ kết nối.",
    keywords: ["周末", "平时", "经常", "比如", "跟...一起..."],
  },
  {
    num: 3,
    name: "Thuyết trình chủ đề",
    zh: "主题阐述",
    desc: "Bàn luận chủ đề chuyên sâu",
    tips: "Trình bày quan điểm rõ ràng về chủ đề được nêu. Đưa ra ví dụ cụ thể để minh họa luận điểm.",
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

const getQuestionHint = (stage: number, text: string): string => {
  if (text.includes("准备好了吗") || text.includes("介绍一下你自己") || stage === 1) {
    return "💡 Gợi ý: Giới thiệu họ tên, tuổi tác, công việc/học tập, và lý do bạn muốn học tiếng Trung hoặc thi HSK.";
  }
  if (text.includes("日常生活") || text.includes("空闲时间") || text.includes("兴趣爱好") || stage === 2) {
    return "💡 Gợi ý: Chia sẻ các thói quen hàng ngày, sở thích cuối tuần (đọc sách, xem phim, thể thao, gặp gỡ bạn bè...).";
  }
  if (text.includes("主题讨论") || text.includes("科技") || text.includes("人工智能") || stage === 3) {
    return "💡 Gợi ý: Nêu rõ quan điểm của bạn về ưu điểm của công nghệ/AI trong học tập và vai trò không thể thay thế của giáo viên.";
  }
  if (text.includes("过度依赖") || text.includes("人际交往") || text.includes("解决办法") || stage === 4) {
    return "💡 Gợi ý: Đề xuất giải pháp cân bằng (kết hợp học AI với tham gia câu lạc bộ khẩu ngữ, giao tiếp thực tế với người bản xứ).";
  }
  if (stage === 5) {
    return "💡 Gợi ý: Lắng nghe nhận xét tổng kết từ giám khảo và gửi lời chào/cảm ơn để hoàn tất buổi thi.";
  }
  return "💡 Gợi ý: Hãy trả lời tự nhiên, rõ ràng, tập trung vào đúng trọng tâm câu hỏi của giám khảo.";
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
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("Google 國語（臺灣）");
  const [recognitionLang, setRecognitionLang] = useState<string>("zh-TW");

  // Modals & Panels
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showRubricDrawer, setShowRubricDrawer] = useState(false);

  // Audio References
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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
        throw new Error("Không thể tải phiên thi khảo thí.");
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
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
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
        "Trình duyệt chưa hỗ trợ Web Speech Recognition tự động. Bạn có thể gõ trực tiếp câu trả lời bằng tiếng Trung vào ô nhập bên dưới."
      );
      textareaRef.current?.focus();
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
          <div className="absolute inset-0 flex items-center justify-center text-rose-600 font-bold text-lg">
            李
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Đang vào phòng thi khẩu ngữ...
          </h3>
          <p className="text-xs text-slate-500">Entering Oral Examination Studio</p>
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            Quay lại danh sách bài thi
          </Button>
        </div>
      </div>
    );
  }

  const latestExaminerTurn = [...session.turns].reverse().find((t) => t.speaker === "EXAMINER");
  const characterCount = learnerTranscript.trim().replace(/\s+/g, "").length;
  const currentStageInfo = STAGES.find((s) => s.num === session.currentStage) || STAGES[0];

  return (
    <div className="fixed inset-0 z-30 flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 select-none">
      {/* 1. TOP HEADER (Height: 48px, fixed) */}
      <header className="h-12 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between shrink-0 z-10">
        {/* Left: Exit & Topic info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white h-8 px-2.5 rounded-lg -ml-1 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Thoát</span>
          </Button>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shrink-0 shadow-2xs">
              {session.template.targetLevel}
            </span>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {session.template.title}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              Đang diễn ra
            </span>
          </div>
        </div>

        {/* Right: Rubric Drawer Button, Timer, Mic Status, Audio Settings */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRubricDrawer(true)}
            className="h-8 px-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60 bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/40 rounded-lg gap-1.5"
            title="Xem tiêu chí chấm điểm và mẹo chặng thi"
          >
            <Award className="h-3.5 w-3.5 text-rose-600" />
            <span className="hidden sm:inline">Mẹo & Tiêu chí</span>
          </Button>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
            <Clock className="h-3 w-3 text-rose-600" />
            <span className="font-mono text-xs">{formatDuration(elapsedSeconds)}</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isRecording
                ? "bg-rose-500 text-white animate-pulse"
                : isExaminerSpeaking
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {isRecording ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                <span>Thu: {recordingSeconds}s</span>
              </>
            ) : isExaminerSpeaking ? (
              <button
                type="button"
                onClick={stopExaminerVoice}
                className="inline-flex items-center gap-1 cursor-pointer hover:opacity-85"
                title="Dừng đọc (Esc)"
              >
                <Square className="h-2.5 w-2.5 fill-rose-600 text-rose-600 animate-pulse" />
                <span className="hidden sm:inline">Đang đọc &bull; </span>
                <span>Dừng</span>
              </button>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Mic sẵn sàng</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAudioModal(true)}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
            title="Cài đặt giọng đọc và microphone"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 2. 5-STAGE STEPPER (Height: ~38px, slim bar, fixed) */}
      <nav aria-label="Stages" className="h-9 px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 flex items-center justify-between gap-1.5 shrink-0 z-10 overflow-x-auto text-xs">
        {STAGES.map((st) => {
          const isCurrent = session.currentStage === st.num;
          const isPassed = session.currentStage > st.num;

          return (
            <div
              key={st.num}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[11px] font-medium transition-all truncate ${
                isCurrent
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/60"
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
                    ? "bg-rose-600 text-white"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {isPassed ? <Check className="h-2.5 w-2.5" /> : st.num}
              </span>
              <span className="truncate">{st.name}</span>
            </div>
          );
        })}
      </nav>

      {/* 3. MAIN UNIFIED CONVERSATION STREAM (Flex-1, auto-scrolls, ZERO outer page scroll) */}
      <main
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 max-w-4xl w-full mx-auto"
      >
        {session.turns.map((turn, i) => {
          const isExaminer = turn.speaker === "EXAMINER";
          const isLatest = i === session.turns.length - 1;
          const isFirstInStage = i === 0 || session.turns[i - 1]?.stage !== turn.stage;

          return (
            <div key={turn.id || i} className="space-y-3">
              {/* Stage Transition Separator */}
              {isFirstInStage && (
                <div className="flex items-center justify-center my-3">
                  <span className="px-3 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase border border-slate-300/50 dark:border-slate-700/50">
                    Chặng {turn.stage} • {STAGES.find((s) => s.num === turn.stage)?.name} ({STAGES.find((s) => s.num === turn.stage)?.zh})
                  </span>
                </div>
              )}

              {/* Message Bubble Item */}
              {isExaminer ? (
                /* EXAMINER QUESTION BUBBLE (Focal & Clean) */
                <div className="flex items-start gap-3 max-w-[92%] sm:max-w-[85%]">
                  {/* Examiner Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                        isLatest && isExaminerSpeaking
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400"
                          : "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
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

                  {/* Examiner Card Content */}
                  <div
                    className={`rounded-2xl p-4 shadow-xs space-y-2.5 ${
                      isLatest
                        ? "bg-white dark:bg-slate-900 border-2 border-rose-500/80 ring-2 ring-rose-500/10"
                        : "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 opacity-90"
                    }`}
                  >
                    {/* Header line: Examiner name + speed + controls */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Giám khảo Lý (考官李老师)
                        </span>
                        {isLatest && (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.2 rounded-full border border-rose-200 dark:border-rose-900/50">
                            Câu hỏi hiện tại
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isLatest && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.05 : 0.95;
                              setPlaybackSpeed(next);
                              speakExaminerText(turn.textContent, next);
                            }}
                            className="h-6 px-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-md transition-colors"
                            title="Tốc độ đọc"
                          >
                            {playbackSpeed}x
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowPinyin(!showPinyin)}
                          className="h-6 px-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                          title="Bật/Tắt Pinyin"
                        >
                          <Languages className="h-3 w-3" />
                          <span>{showPinyin ? "Ẩn Pinyin" : "Pinyin"}</span>
                        </button>

                        {isLatest && isExaminerSpeaking ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={stopExaminerVoice}
                            className="h-6 px-2 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md gap-1 animate-pulse"
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
                            className="h-6 px-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md gap-1"
                            title="Nghe lại câu hỏi"
                          >
                            <Volume2 className="h-3 w-3" />
                            <span>Nghe lại</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <p
                      className={`font-bold text-slate-900 dark:text-white leading-relaxed ${
                        isLatest ? "text-lg sm:text-xl" : "text-sm sm:text-base"
                      }`}
                    >
                      {turn.textContent}
                    </p>

                    {/* Pinyin */}
                    {showPinyin && turn.pinyinContent && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans tracking-wide leading-relaxed pt-0.5">
                        {turn.pinyinContent}
                      </p>
                    )}

                    {/* Hint for latest question */}
                    {isLatest && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowHint(!showHint)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors"
                        >
                          <Lightbulb className="h-3 w-3 text-amber-500" />
                          <span>{showHint ? "Ẩn gợi ý nghĩa" : "Gợi ý nghĩa câu hỏi"}</span>
                        </button>

                        {showHint && (
                          <div className="mt-2 p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed animate-in fade-in">
                            {getQuestionHint(session.currentStage, turn.textContent)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Waveform indicator when examiner is speaking */}
                    {isLatest && isExaminerSpeaking && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <span>Giám khảo đang đọc câu hỏi...</span>
                        <SoundWave isActive={true} color="cinnabar" size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* LEARNER RESPONSE BUBBLE (Right aligned) */
                <div className="flex flex-col items-end space-y-1 ml-auto max-w-[92%] sm:max-w-[80%]">
                  <span className="text-[10px] font-semibold text-slate-400 px-1">
                    Bạn (Thí sinh)
                  </span>
                  <div className="rounded-2xl rounded-tr-xs p-3.5 bg-rose-600 text-white shadow-xs">
                    <p className="font-medium text-sm leading-relaxed">{turn.textContent}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Transcript when Candidate is speaking */}
        {isRecording && learnerTranscript && (
          <div className="flex flex-col items-end space-y-1 ml-auto max-w-[92%] sm:max-w-[80%] animate-in fade-in">
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

      {/* 4. BOTTOM DOCKED RESPONSE CONSOLE (Fixed height: ~135px, ZERO outer scroll) */}
      <footer className="shrink-0 border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Input Textarea Bar */}
          <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 p-2.5 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <textarea
              ref={textareaRef}
              value={learnerTranscript}
              onChange={(e) => setLearnerTranscript(e.target.value)}
              disabled={isSubmittingTurn || isFinalizing || session?.status === "PROCESSING" || session?.status === "COMPLETED"}
              placeholder={
                session?.status === "PROCESSING" || session?.status === "COMPLETED"
                  ? "Kỳ thi khẩu ngữ đã hoàn tất. Đang chuyển hướng sang báo cáo kết quả..."
                  : isRecording
                  ? "Đang nhận diện giọng nói trực tiếp qua microphone..."
                  : "Bấm 'Bắt đầu nói' hoặc bạn có thể gõ câu trả lời bằng tiếng Trung tại đây..."
              }
              rows={2}
              className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-medium disabled:opacity-60 max-h-14"
            />

            {/* In-box live subtitle status */}
            {isRecording && (
              <div className="flex items-center justify-between pt-1 border-t border-rose-200/60 dark:border-rose-900/40 text-[10px] text-rose-600 font-semibold animate-pulse">
                <span>Đang thu âm qua micro...</span>
                <SoundWave isActive={true} color="cinnabar" size="sm" />
              </div>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left buttons: Recording trigger & Clear */}
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isSubmittingTurn || isExaminerSpeaking || isFinalizing || session?.status === "PROCESSING"}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-xs text-xs h-9 px-4 rounded-xl transition-all"
                >
                  <Mic className="h-4 w-4" />
                  <span>Bắt đầu nói (开始录音)</span>
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2 text-xs h-9 px-4 rounded-xl transition-all"
                >
                  <MicOff className="h-4 w-4" />
                  <span>Dừng ghi âm (完成录音)</span>
                </Button>
              )}

              {learnerTranscript && !isRecording && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLearnerTranscript("")}
                  className="text-xs text-slate-500 hover:text-rose-600 h-9 px-2.5 rounded-xl"
                  title="Xoá câu trả lời và làm lại"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  <span>Làm lại</span>
                </Button>
              )}

              {characterCount > 0 && !isRecording && (
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                  {characterCount} chữ
                </span>
              )}
            </div>

            {/* Right button: Submit Turn */}
            <Button
              onClick={handleSubmitTurn}
              disabled={!learnerTranscript.trim() || isSubmittingTurn || isRecording || isFinalizing || session?.status === "PROCESSING"}
              className={`font-semibold text-xs h-9 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all ${
                learnerTranscript.trim() && !isRecording
                  ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
              }`}
            >
              {isSubmittingTurn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  <span>Đang chấm điểm...</span>
                </>
              ) : (
                <>
                  <span>Gửi câu trả lời (提交回答)</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>

      {/* 5. SLIDE-OVER DRAWER: RUBRIC & STAGE TIPS */}
      {showRubricDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
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
                  4 Tiêu Chuẩn Đánh Giá
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
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 rounded-xl"
            >
              Đã hiểu, quay lại phòng thi
            </Button>
          </div>
        </div>
      )}

      {/* 6. AUDIO SETTINGS MODAL */}
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
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs h-8 px-4"
                >
                  Hoàn tất
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. EXIT CONFIRMATION MODAL */}
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
                className="text-xs h-9 rounded-xl"
              >
                Ở lại
              </Button>
              <Button
                onClick={() => router.push("/dashboard/assessments")}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 rounded-xl"
              >
                Xác nhận thoát
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. FINALIZING OVERLAY MODAL */}
      {isFinalizing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
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
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 text-left border border-slate-100 dark:border-slate-800">
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
