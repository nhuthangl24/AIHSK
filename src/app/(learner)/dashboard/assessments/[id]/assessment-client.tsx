"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SoundWave } from "@/components/ui/sound-wave";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
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
  MessageSquare,
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
    tips: "Giới thiệu tên, tuổi, lý do học tiếng Trung. Phát âm chuẩn thanh điệu.",
    keywords: ["我叫...", "今年...岁", "学习中文...", "因为..."],
  },
  {
    num: 2,
    name: "Giao tiếp đời sống",
    zh: "日常交流",
    desc: "Sở thích & thói quen sinh hoạt",
    tips: "Miêu tả thói quen cuối tuần hoặc sở thích cá nhân. Sử dụng câu đầy đủ có từ nối.",
    keywords: ["周末", "平时", "经常", "比如", "跟...一起..."],
  },
  {
    num: 3,
    name: "Thuyết trình chủ đề",
    zh: "主题阐述",
    desc: "Bàn luận chủ đề chuyên sâu",
    tips: "Trình bày quan điểm về công nghệ/AI trong học tập. Đưa ra lập luận rõ ràng.",
    keywords: ["我认为", "优势", "方便", "但是", "不能完全代替..."],
  },
  {
    num: 4,
    name: "Phản biện & Mở rộng",
    zh: "深入追问",
    desc: "Phản biện & câu hỏi mở rộng",
    tips: "Đề xuất giải pháp cho vấn đề được nêu. Giữ mạch nói liên tục, tránh ngắt quãng lâu.",
    keywords: ["针对这个问题", "建议", "平衡", "结合", "其实..."],
  },
  {
    num: 5,
    name: "Tổng kết & Đánh giá",
    zh: "考试总结",
    desc: "Kết thúc & đánh giá tổng thể",
    tips: "Lắng nghe nhận xét tổng kết và đáp lời chào cảm ơn giám khảo lịch sự.",
    keywords: ["非常感谢", "谢谢考官", "收获很多", "再见"],
  },
];

const getQuestionHint = (stage: number, text: string): string => {
  if (text.includes("准备好了吗") || text.includes("介绍一下你自己") || stage === 1) {
    return "💡 Gợi ý: Giới thiệu họ tên, tuổi tác, công việc/học tập, và lý do bạn muốn học tiếng Trung hoặc thi HSK.";
  }
  if (text.includes("日常生活") || text.includes("空闲时间") || text.includes("兴趣爱好") || stage === 2) {
    return "💡 Gợi ý: Chia sẻ các thói quen hàng ngày, sở thích cuối tuần (đọc sách, xem phim, thể thao, tụ tập bạn bè...).";
  }
  if (text.includes("主题讨论") || text.includes("科技") || text.includes("人工智能") || stage === 3) {
    return "💡 Gợi ý: Nêu rõ quan điểm của bạn về ưu điểm của công nghệ/AI trong học tiếng Trung (tiện lợi, luyện phát âm...) và vai trò không thể thay thế của giáo viên.";
  }
  if (text.includes("过度依赖") || text.includes("人际交往") || text.includes("解决办法") || stage === 4) {
    return "💡 Gợi ý: Đề xuất giải pháp cân bằng (ví dụ: kết hợp học AI với tham gia câu lạc bộ khẩu ngữ, giao tiếp thực tế với người bản xứ).";
  }
  if (stage === 5) {
    return "💡 Gợi ý: Lắng nghe nhận xét tổng kết từ giám khảo và gửi lời chào/cảm ơn để hoàn tất buổi thi.";
  }
  return "💡 Gợi ý: Hãy trả lời tự nhiên, rõ ràng, tập trung vào trọng tâm câu hỏi của giám khảo.";
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

  // Right column tab: "transcript" | "rubric"
  const [rightTab, setRightTab] = useState<"transcript" | "rubric">("transcript");

  // Modals
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load and configure browser TTS voices with priority to Google 國語（臺灣） (zh-TW)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const findTaiwanVoice = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      const zhVoices = allVoices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith("zh") ||
          v.name.includes("國語") ||
          v.name.includes("Taiwan") ||
          v.name.includes("臺灣") ||
          v.name.includes("Chinese") ||
          v.name.includes("Mandarin") ||
          v.name.includes("Mei-Jia")
      );
      setAvailableVoices(zhVoices.length > 0 ? zhVoices : allVoices);

      // Priority 1: Google 國語（臺灣）
      const googleTW = allVoices.find(
        (v) =>
          v.name.includes("Google 國語（臺灣）") ||
          v.name.includes("Google 國語 (臺灣)") ||
          (v.name.toLowerCase().includes("google") &&
            v.lang.toLowerCase().replace("_", "-") === "zh-tw")
      );

      // Priority 2: Any Taiwan zh-TW voice (e.g. Mei-Jia)
      const anyTW = allVoices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === "zh-tw" ||
          v.name.includes("臺灣") ||
          v.name.includes("Taiwan") ||
          v.name.includes("Mei-Jia")
      );

      // Priority 3: Any Chinese voice
      const anyZh = allVoices.find((v) => v.lang.toLowerCase().startsWith("zh"));

      const target = googleTW || anyTW || anyZh;
      if (target) {
        setSelectedVoiceName(target.name);
      }
    };

    findTaiwanVoice();
    window.speechSynthesis.onvoiceschanged = findTaiwanVoice;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Fetch initial session details
  const fetchSession = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/assessments/${id}`);
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response (e.g. server starting up or HTML 500)
      }

      if (!res.ok) {
        throw new Error(data?.error || `Không thể tải phòng thi (mã phản hồi ${res.status})`);
      }
      if (!data?.session) {
        throw new Error("Không tìm thấy thông tin phòng thi.");
      }

      setSession(data.session);

      if (data.session.status === "COMPLETED") {
        router.push(`/dashboard/reports/${id}`);
      } else if (data.session.status === "PROCESSING") {
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
          } catch {
            // Silence network glitch during background polling
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error("fetchSession error:", err);
      setError(err.message || "Không thể tải phòng thi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // Elapsed timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [id]);

  // Auto-scroll chat to latest turn
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [session?.turns, learnerTranscript]);

  // Play Examiner Voice using Web Speech Synthesis
  const speakExaminerText = (text: string, customSpeed?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const allVoices = window.speechSynthesis.getVoices();
    const targetVoice =
      allVoices.find((v) => v.name === selectedVoiceName) ||
      allVoices.find(
        (v) =>
          v.name.includes("Google 國語（臺灣）") ||
          v.name.includes("Google 國語 (臺灣)") ||
          (v.name.toLowerCase().includes("google") &&
            v.lang.toLowerCase().replace("_", "-") === "zh-tw")
      ) ||
      allVoices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === "zh-tw" ||
          v.name.includes("臺灣") ||
          v.name.includes("Taiwan") ||
          v.name.includes("Mei-Jia")
      ) ||
      allVoices.find((v) => v.lang.toLowerCase().startsWith("zh"));

    if (targetVoice) {
      utterance.voice = targetVoice;
      utterance.lang = targetVoice.lang || "zh-TW";
    } else {
      utterance.lang = "zh-TW";
    }

    utterance.rate = customSpeed ?? playbackSpeed;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsExaminerSpeaking(true);
    utterance.onend = () => setIsExaminerSpeaking(false);
    utterance.onerror = () => setIsExaminerSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop Examiner Voice immediately
  const stopExaminerVoice = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsExaminerSpeaking(false);
    }
  };

  // Keyboard shortcut: Press Escape to stop examiner speech
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExaminerSpeaking) {
        stopExaminerVoice();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExaminerSpeaking]);

  // Play the latest examiner turn on load or update
  useEffect(() => {
    if (!session?.turns || session.turns.length === 0) return;
    const latestTurn = session.turns[session.turns.length - 1];
    if (latestTurn.speaker === "EXAMINER") {
      speakExaminerText(latestTurn.textContent);
    }
  }, [session?.turns.length]);

  // Initialize Speech Recognition
  const startRecording = () => {
    if (typeof window === "undefined") return;

    // Stop examiner audio if currently speaking
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

  // Quick test voice sample in modal (toggles speak / stop)
  const handleTestVoiceSample = () => {
    if (isExaminerSpeaking) {
      stopExaminerVoice();
    } else {
      speakExaminerText("你好！我是考官李老师，很高兴为你提供华语口语评估服务。");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
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
      <div className="max-w-md mx-auto my-14 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 text-center space-y-5 shadow-xl">
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
    );
  }

  const latestExaminerTurn = [...session.turns].reverse().find((t) => t.speaker === "EXAMINER");
  const characterCount = learnerTranscript.trim().replace(/\s+/g, "").length;
  const currentStageInfo = STAGES.find((s) => s.num === session.currentStage) || STAGES[0];

  return (
    <div className="flex flex-col space-y-4 max-w-6xl mx-auto pb-8">
      {/* 1. Top Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 py-1">
        {/* Left: Test title & Level badge */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white h-8 px-2.5 rounded-lg -ml-1 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span>Thoát</span>
          </Button>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-xs">
              {session.template.targetLevel}
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {session.template.title}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              Đang diễn ra
            </span>
          </div>
        </div>

        {/* Right: Timer, Live Mic status, Audio Settings */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="h-3.5 w-3.5 text-rose-600" />
            <span className="font-mono">{formatDuration(elapsedSeconds)}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isRecording
                ? "bg-rose-500 text-white animate-pulse"
                : isExaminerSpeaking
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {isRecording ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                <span>Đang thu ({recordingSeconds}s)</span>
              </>
            ) : isExaminerSpeaking ? (
              <button
                type="button"
                onClick={stopExaminerVoice}
                className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                title="Bấm để dừng giọng giám khảo (Phím tắt: Esc)"
              >
                <Square className="h-3 w-3 fill-rose-600 text-rose-600 animate-pulse" />
                <span>Giám khảo đang nói &bull; <strong>Dừng lại</strong></span>
              </button>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Mic sẵn sàng</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAudioModal(true)}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full"
            title="Cài đặt giọng đọc và microphone"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 2. 5-Stage Stepper Navigation */}
      <nav aria-label="Stages" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STAGES.map((st) => {
          const isCurrent = session.currentStage === st.num;
          const isPassed = session.currentStage > st.num;

          return (
            <div
              key={st.num}
              className={`rounded-2xl p-3 border transition-all ${
                isCurrent
                  ? "bg-white dark:bg-slate-900 border-rose-500 ring-2 ring-rose-500/10 shadow-sm"
                  : isPassed
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-slate-50/60 dark:bg-slate-900/30 border-slate-200/70 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    isPassed
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {isPassed ? <Check className="h-3 w-3" /> : st.num}
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isCurrent
                      ? "text-rose-600 dark:text-rose-400 font-extrabold"
                      : isPassed
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {isCurrent ? "Đang thi" : isPassed ? "Đã qua" : `Chặng ${st.num}`}
                </span>
              </div>

              <div
                className={`text-xs font-bold truncate ${
                  isCurrent
                    ? "text-slate-900 dark:text-white"
                    : isPassed
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-500"
                }`}
              >
                {st.name}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{st.zh}</div>
            </div>
          );
        })}
      </nav>

      {/* 3. Main Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): Examiner Card & Candidate Response Deck with Textarea */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Card 1: Examiner Focal Question Card */}
          <Card className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {/* Examiner Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${
                        isExaminerSpeaking
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105 ring-2 ring-rose-400"
                          : "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      李
                    </div>
                    {isExaminerSpeaking ? (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        Giám khảo Lý (考官李老师)
                      </span>
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50 shrink-0">
                        Giám Khảo Cao Cấp
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Tiếng Trung Chuẩn • Chặng {session.currentStage}/5: {currentStageInfo.name} ({currentStageInfo.zh})
                    </div>
                  </div>
                </div>

                {/* Quick Audio Controls */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      const next = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.05 : 0.95;
                      setPlaybackSpeed(next);
                      if (latestExaminerTurn) speakExaminerText(latestExaminerTurn.textContent, next);
                    }}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Tốc độ giọng đọc"
                  >
                    {playbackSpeed}x
                  </button>

                  <Button
                    variant={showPinyin ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setShowPinyin(!showPinyin)}
                    className="h-8 px-2.5 text-xs text-slate-700 dark:text-slate-300 rounded-lg gap-1"
                    title="Bật/Tắt Pinyin"
                  >
                    <Languages className="h-3.5 w-3.5" />
                    <span>{showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}</span>
                  </Button>

                  {isExaminerSpeaking ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={stopExaminerVoice}
                      className="h-8 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg gap-1.5 shadow-sm animate-pulse"
                      title="Dừng phát giọng giám khảo (Phím tắt: Esc)"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span>Dừng đọc (停止)</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (latestExaminerTurn) speakExaminerText(latestExaminerTurn.textContent);
                      }}
                      className="h-8 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-900/50 rounded-lg gap-1.5"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Nghe lại (重听)</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Question Text Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-600" />
                    Câu hỏi của giám khảo • 考官发问
                  </span>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 transition-colors"
                  >
                    <Lightbulb className="h-3 w-3" />
                    <span>{showHint ? "Ẩn gợi ý nghĩa" : "Gợi ý nghĩa câu hỏi"}</span>
                  </button>
                </div>

                {/* Chinese Question */}
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed tracking-normal">
                  {latestExaminerTurn?.textContent || "你好！请问你准备好了吗？请先用中文简单介绍一下你自己吧。"}
                </p>

                {/* Pinyin Text */}
                {showPinyin && latestExaminerTurn?.pinyinContent && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-sans tracking-wide leading-relaxed pt-1">
                    {latestExaminerTurn.pinyinContent}
                  </p>
                )}

                {/* Collapsible Hint Accordion */}
                {showHint && latestExaminerTurn && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed animate-in fade-in">
                    {getQuestionHint(session.currentStage, latestExaminerTurn.textContent)}
                  </div>
                )}
              </div>

              {/* SoundWave visualizer during examiner speech */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {isExaminerSpeaking
                      ? "Giám khảo đang đọc câu hỏi... Hãy chú ý lắng nghe"
                      : "Giám khảo đang đợi câu trả lời từ bạn qua microphone"}
                  </span>
                  {isExaminerSpeaking && (
                    <button
                      type="button"
                      onClick={stopExaminerVoice}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors"
                      title="Dừng đọc (Esc)"
                    >
                      <Square className="h-2.5 w-2.5 fill-current" />
                      <span>Dừng đọc</span>
                    </button>
                  )}
                </div>
                <SoundWave isActive={isExaminerSpeaking} color="cinnabar" size="md" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Candidate Response Deck (With PROMINENT TEXTAREA) */}
          <Card
            className={`border rounded-3xl bg-white dark:bg-slate-900 shadow-sm transition-all overflow-hidden ${
              isRecording
                ? "border-rose-400 dark:border-rose-700 ring-2 ring-rose-500/20"
                : "border-slate-200/90 dark:border-slate-800"
            }`}
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isRecording
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-rose-50 dark:bg-rose-950/60 text-rose-600"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Câu trả lời của bạn • 考生应答
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Nói qua micro để hệ thống tự động ghi chữ, hoặc bạn có thể gõ trực tiếp vào ô bên dưới
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                      <span className="h-2 w-2 rounded-full bg-rose-600" />
                      Đang thu: {recordingSeconds}s
                    </span>
                  )}
                  {characterCount > 0 && !isRecording && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      字数: {characterCount} chữ
                    </span>
                  )}
                </div>
              </div>

              {/* The Response Textarea (Always Present & Beautifully Styled) */}
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 p-4 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <textarea
                  ref={textareaRef}
                  value={learnerTranscript}
                  onChange={(e) => setLearnerTranscript(e.target.value)}
                  disabled={isSubmittingTurn || isFinalizing || session?.status === "PROCESSING" || session?.status === "COMPLETED"}
                  placeholder={
                    session?.status === "PROCESSING" || session?.status === "COMPLETED"
                      ? "Kỳ thi khẩu ngữ đã hoàn tất. Đang chuyển hướng sang báo cáo kết quả..."
                      : isRecording
                      ? "Đang nhận diện giọng nói tiếng Trung trực tiếp..."
                      : "Nhấn 'Bắt đầu nói' hoặc bạn có thể gõ câu trả lời bằng tiếng Trung tại đây..."
                  }
                  rows={4}
                  className="w-full border-0 bg-transparent p-0 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-medium disabled:opacity-60"
                />

                {/* Subtitle helper inside textarea */}
                {isRecording && (
                  <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                    <span>Đang lắng nghe tiếng Trung qua microphone...</span>
                    <SoundWave isActive={true} color="cinnabar" size="sm" />
                  </div>
                )}
              </div>

              {/* Action Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Left: Recording trigger & clear */}
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={isSubmittingTurn || isExaminerSpeaking || isFinalizing || session?.status === "PROCESSING"}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-xs text-xs h-10 px-5 rounded-xl transition-all"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Bắt đầu nói (开始录音)</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2 text-xs h-10 px-5 rounded-xl transition-all"
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
                      className="text-xs text-slate-500 hover:text-rose-600 h-10 px-3 rounded-xl"
                      title="Xoá câu trả lời và làm lại"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Xoá làm lại
                    </Button>
                  )}
                </div>

                {/* Right: Submit Button */}
                <Button
                  onClick={handleSubmitTurn}
                  disabled={!learnerTranscript.trim() || isSubmittingTurn || isRecording || isFinalizing || session?.status === "PROCESSING"}
                  className={`font-semibold text-xs h-10 px-6 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all ${
                    learnerTranscript.trim() && !isRecording
                      ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                  }`}
                >
                  {isSubmittingTurn ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      <span>Đang phân tích câu trả lời...</span>
                    </>
                  ) : (
                    <>
                      <span>Gửi câu trả lời (提交回答)</span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Examination Transcript & Rubric Intelligence Hub */}
        <div className="lg:col-span-5 flex flex-col h-[600px] lg:h-[660px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header with Switcher Tabs */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setRightTab("transcript")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  rightTab === "transcript"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Hội thoại ({session.turns.length})</span>
              </button>

              <button
                onClick={() => setRightTab("rubric")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  rightTab === "rubric"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Award className="h-3.5 w-3.5 text-rose-600" />
                <span>Mẹo & Tiêu chí</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
              {session.turns.length} Lượt thoại
            </span>
          </div>

          {/* TAB 1: Transcript Feed */}
          {rightTab === "transcript" && (
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 space-y-4 overflow-y-auto text-xs leading-relaxed"
            >
              {session.turns.map((turn, i) => {
                const isExaminer = turn.speaker === "EXAMINER";
                const isFirstInStage =
                  i === 0 || session.turns[i - 1]?.stage !== turn.stage;

                return (
                  <div key={turn.id || i} className="space-y-2">
                    {/* Stage badge */}
                    {isFirstInStage && (
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 tracking-wider uppercase border border-slate-200/60 dark:border-slate-700/60">
                          Chặng {turn.stage} • {STAGES.find((s) => s.num === turn.stage)?.name}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex flex-col space-y-1 ${
                        isExaminer ? "items-start" : "items-end"
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-400 px-1">
                        {isExaminer ? "Giám khảo Lý (考官)" : "Bạn (Thí sinh)"}
                      </span>

                      <div
                        className={`max-w-[90%] rounded-2xl p-3.5 shadow-xs ${
                          isExaminer
                            ? "bg-slate-100/90 text-slate-900 dark:bg-slate-800 dark:text-white rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60"
                            : "bg-rose-600 text-white rounded-tr-xs"
                        }`}
                      >
                        <p className="font-medium text-xs sm:text-sm leading-relaxed">
                          {turn.textContent}
                        </p>

                        {isExaminer && showPinyin && turn.pinyinContent && (
                          <p className="text-[11px] opacity-75 mt-1.5 italic font-sans border-t border-slate-200/50 dark:border-slate-700/50 pt-1">
                            {turn.pinyinContent}
                          </p>
                        )}

                        {isExaminer && (
                          <div className="mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                            {isExaminerSpeaking ? (
                              <button
                                type="button"
                                onClick={stopExaminerVoice}
                                className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-700 font-bold"
                              >
                                <Square className="h-2.5 w-2.5 fill-current" />
                                <span>Dừng đọc (Esc)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => speakExaminerText(turn.textContent)}
                                className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-rose-600 dark:text-slate-400 font-semibold"
                              >
                                <Volume2 className="h-3 w-3" />
                                <span>Nghe lại</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Live interim text preview in stream */}
              {isRecording && learnerTranscript && (
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-[10px] font-semibold text-rose-500 animate-pulse">
                    Đang nói trực tiếp...
                  </span>
                  <div className="max-w-[90%] rounded-2xl p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 rounded-tr-xs italic">
                    <p>{learnerTranscript}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Rubric & Stage Tips */}
          {rightTab === "rubric" && (
            <div className="flex-1 p-5 space-y-4 overflow-y-auto text-xs leading-relaxed">
              {/* Current stage advice */}
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 dark:text-rose-200">
                  <Lightbulb className="h-4 w-4 text-rose-600" />
                  <span>Mục tiêu Chặng {currentStageInfo.num}: {currentStageInfo.name}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentStageInfo.tips}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block mb-1.5">
                    Từ vựng gợi ý nên dùng:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentStageInfo.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-lg border border-rose-200/60 dark:border-rose-900/40 shadow-2xs"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* HSK 3 Rubric dimensions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Tiêu chuẩn đánh giá HSK 3
                </span>

                <div className="space-y-2">
                  {[
                    {
                      title: "Phát âm & Thanh điệu",
                      desc: "Chuẩn xác 4 thanh điệu tiếng Trung, biến điệu '一', '不' và thanh nhẹ.",
                    },
                    {
                      title: "Độ trôi chảy & Lưu loát",
                      desc: "Tốc độ nói ổn định, ngắt nghỉ đúng cụm ngữ nghĩa, hạn chế 'ừm, à' kéo dài.",
                    },
                    {
                      title: "Từ vựng & Cấu trúc ngữ pháp",
                      desc: "Vận dụng tốt từ vựng HSK 3 (khoảng 600 từ) và các mẫu câu liên kết.",
                    },
                    {
                      title: "Mức độ hoàn thành & Phản xạ",
                      desc: "Trả lời đúng trọng tâm câu hỏi của giám khảo, có mở rộng thông tin.",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stream Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Tự động lưu lịch sử</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Phòng thi bảo mật</span>
            </span>
          </div>
        </div>
      </div>

      {/* Audio & Voice Settings Modal */}
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
                  <p className="text-xs text-slate-500">Hệ thống âm thanh & Giọng đọc khẩu ngữ</p>
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

            <div className="space-y-4">
              {/* Voice Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Giọng đọc của Giám khảo (TTS Voice)
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full text-xs h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  {availableVoices.map((v) => {
                    const isGoogleTW =
                      v.name.includes("Google 國語（臺灣）") ||
                      v.name.includes("Google 國語 (臺灣)") ||
                      (v.name.toLowerCase().includes("google") &&
                        v.lang.toLowerCase().replace("_", "-") === "zh-tw");
                    return (
                      <option key={v.name} value={v.name}>
                        {isGoogleTW ? "✓ " : ""}
                        {v.name} ({v.lang})
                      </option>
                    );
                  })}
                </select>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đang sử dụng giọng chuẩn: Google 國語（臺灣） (zh-TW)</span>
                </div>
              </div>

              {/* Speech Speed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tốc độ đọc của Giám khảo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { rate: 0.85, label: "Chậm (0.85x)" },
                    { rate: 0.95, label: "Chuẩn (0.95x)" },
                    { rate: 1.1, label: "Nhanh (1.1x)" },
                  ].map((s) => (
                    <button
                      key={s.rate}
                      type="button"
                      onClick={() => setPlaybackSpeed(s.rate)}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                        playbackSpeed === s.rate
                          ? "border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Audio Button */}
              <div className="pt-2">
                <Button
                  variant={isExaminerSpeaking ? "destructive" : "outline"}
                  onClick={handleTestVoiceSample}
                  className={`w-full text-xs h-10 rounded-xl gap-2 ${
                    isExaminerSpeaking
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {isExaminerSpeaking ? (
                    <>
                      <Square className="h-4 w-4 fill-current" />
                      <span>Dừng phát âm mẫu của giám khảo</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-rose-600" />
                      <span>Nghe thử phát âm mẫu của giám khảo</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={() => setShowAudioModal(false)}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-9 px-5"
              >
                Hoàn tất cài đặt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Exam Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-5 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rời khỏi phòng thi?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bài thi đang diễn ra ở Chặng {session.currentStage}. Bạn có thể tiếp tục bất cứ lúc nào từ trang Quản lý bài thi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="text-xs h-9 rounded-xl"
              >
                Ở lại phòng thi
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

      {/* Finalizing Overlay Modal */}
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
