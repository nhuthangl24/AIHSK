"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Volume2,
  Square,
  Sparkles,
  Send,
  Languages,
  RotateCcw,
  Lightbulb,
  Keyboard,
  CheckCircle2,
  Loader2,
  X,
  Award,
  ChevronDown,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  FREE_TALK_PERSONAS,
  FreeTalkMessage,
  FreeTalkPersona,
  FreeTalkEvaluation,
} from "@/lib/ai/free-talk-service";

const HSK_LEVELS = [
  "Tự do (Mọi trình độ)",
  "HSK 1 (Sơ cấp 1)",
  "HSK 2 (Sơ cấp 2)",
  "HSK 3 (Trung cấp 1)",
  "HSK 4 (Trung cấp 2)",
  "HSK 5 (Cao cấp 1)",
  "HSK 6 (Cao cấp 2)",
];

export default function FreeTalkClient() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("friendly_peer");
  const [selectedLevel, setSelectedLevel] = useState<string>("Tự do (Mọi trình độ)");
  const currentPersona: FreeTalkPersona =
    FREE_TALK_PERSONAS[selectedPersonaId] || FREE_TALK_PERSONAS.friendly_peer;

  // Messages state
  const [messages, setMessages] = useState<FreeTalkMessage[]>([
    {
      role: "assistant",
      content: currentPersona.greeting,
      pinyin: currentPersona.greetingPinyin,
      translation: currentPersona.greetingVi,
      suggestions: currentPersona.initialSuggestions,
    },
  ]);

  // Voice & Input state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [learnerInput, setLearnerInput] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  // Display toggles
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showIntroBanner, setShowIntroBanner] = useState(true);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<FreeTalkEvaluation | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  // Audio References
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isRecording, learnerInput, isLoadingReply]);

  // When persona changes, reset chat with new persona's greeting
  const handleSelectPersona = (id: string) => {
    if (id === selectedPersonaId) return;
    setSelectedPersonaId(id);
    const p = FREE_TALK_PERSONAS[id] || FREE_TALK_PERSONAS.friendly_peer;
    setMessages([
      {
        role: "assistant",
        content: p.greeting,
        pinyin: p.greetingPinyin,
        translation: p.greetingVi,
        suggestions: p.initialSuggestions,
      },
    ]);
    stopTTS();
  };

  // Text-to-speech audio
  const speakText = (text: string, speedOverride?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, "")
      .replace(/[\(\[（【].*?[\)\]）】]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = speedOverride || playbackSpeed;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice =
      voices.find((v) => v.name.includes("Google") && v.name.includes("國語")) ||
      voices.find((v) => v.lang.startsWith("zh")) ||
      voices[0];
    if (zhVoice) utterance.voice = zhVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Speech Recognition Start/Stop
  const startRecording = () => {
    if (typeof window === "undefined") return;
    stopTTS();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt chưa hỗ trợ ghi âm trực tiếp. Bạn có thể chuyển sang chế độ gõ phím để nhập câu trả lời.");
      setInputMode("text");
      setTimeout(() => textareaRef.current?.focus(), 100);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
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
        setLearnerInput(currentText);
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

  // Submit User Message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || learnerInput).trim();
    if (!messageContent || isLoadingReply) return;

    stopRecording();
    setLearnerInput("");
    setIsLoadingReply(true);

    const updatedMessages: FreeTalkMessage[] = [
      ...messages,
      { role: "user", content: messageContent },
    ];
    setMessages(updatedMessages);

    try {
      const res = await fetch("/api/free-talk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          level: selectedLevel,
          personaId: selectedPersonaId,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể nhận phản hồi từ bạn trò chuyện.");
      }

      const data = await res.json();
      const aiReply: FreeTalkMessage = {
        role: "assistant",
        content: data.reply,
        pinyin: data.pinyin,
        translation: data.translation,
        tip: data.tip,
        suggestions: data.suggestions || [],
      };

      setMessages((prev) => [...prev, aiReply]);
      speakText(data.reply);
    } catch (err: any) {
      console.error("Free Talk submission error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "说得很好！和你聊天真愉快。你平时还有什么感兴趣的事情想聊聊吗？",
          pinyin: "Shuō de hěn hǎo! Hé nǐ liáotiān zhēn yúkuài. Nǐ píngshí hái yǒu shénme gǎn xìngqù de shìqing xiǎng liáoliao ma?",
          translation: "Bạn nói hay lắm! Trò chuyện cùng bạn thật vui. Bình thường bạn còn chuyện gì hứng thú muốn tán gẫu thêm không?",
          suggestions: currentPersona.initialSuggestions,
        },
      ]);
    } finally {
      setIsLoadingReply(false);
    }
  };

  const userTurnCount = messages.filter((m) => m.role === "user").length;

  const handleEvaluateSession = async () => {
    stopRecording();
    stopTTS();
    setShowSummaryModal(true);

    if (userTurnCount === 0) {
      setEvaluationResult({
        overallScore: 0,
        hskEstimate: selectedLevel.includes("HSK") ? selectedLevel.slice(0, 5) : "HSK 1",
        fluencyScore: 0,
        grammarScore: 0,
        vocabularyScore: 0,
        summary: "Bạn chưa gửi câu phản xạ nào trong phòng trò chuyện. Hãy nói hoặc gõ ít nhất 1-2 câu tiếng Trung để AI có thể phân tích và chấm điểm nhé!",
        strengths: ["Đã bước vào phòng luyện khẩu ngữ tự do"],
        improvements: ["Tự tin nói thử một vài câu tiếng Trung bất kỳ."],
        corrections: [],
      });
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await fetch("/api/free-talk/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content, pinyin: m.pinyin })),
          level: selectedLevel,
          personaId: selectedPersonaId,
        }),
      });

      if (!res.ok) throw new Error("Chấm điểm thất bại");
      const data = await res.json();
      setEvaluationResult(data.evaluation);
      if (data.sessionId) setSavedSessionId(data.sessionId);
    } catch (e) {
      console.error("Evaluate error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRestartChat = () => {
    if (confirm("Bắt đầu cuộc trò chuyện mới từ đầu?")) {
      handleSelectPersona(selectedPersonaId);
    }
  };

  return (
    <div className="fixed inset-x-0 top-14 bottom-16 z-20 flex flex-col bg-white dark:bg-slate-900 overflow-hidden md:static md:inset-auto md:h-[calc(100vh-5.5rem)] md:max-w-5xl md:mx-auto md:rounded-3xl md:border md:border-slate-200/90 md:dark:border-slate-800 md:shadow-sm select-none">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER BAR: Persona Selector & Quick Actions                   */}
      {/* ==================================================================== */}
      <header className="px-3 py-2 sm:px-6 sm:py-3 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 shrink-0 z-20 shadow-2xs">
        {/* Row 1 on Mobile / Left on Desktop: Persona Switcher + Evaluate Button */}
        <div className="flex items-center justify-between gap-2 w-full md:w-auto">
          {/* Persona Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60 overflow-x-auto no-scrollbar shrink-0 max-w-[calc(100%-92px)] sm:max-w-none">
            {Object.values(FREE_TALK_PERSONAS).map((p) => {
              const isSelected = p.id === selectedPersonaId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPersona(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={p.description}
                >
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-lg overflow-hidden shrink-0 shadow-2xs border border-emerald-500/40 bg-emerald-50/20">
                    <img src="/icon.svg" alt="HSK Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="truncate text-[11px] sm:text-xs">
                    {p.name.split(" ")[0]} <span className="hidden sm:inline">({p.zhName})</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Evaluate Button (Always visible without clipping) */}
          <Button
            size="sm"
            onClick={handleEvaluateSession}
            disabled={isEvaluating}
            className="h-8 px-2.5 sm:px-3 text-[11px] font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 rounded-xl shadow-xs flex items-center gap-1 shrink-0 transition-all ml-auto"
            title="Kết thúc và xem báo cáo AI đánh giá trình độ"
          >
            {isEvaluating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-rose-200" />
                <span>Đánh giá</span>
                {userTurnCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-white/25 rounded-md text-[9px]">
                    {userTurnCount}
                  </span>
                )}
              </>
            )}
          </Button>
        </div>

        {/* Row 2 on Mobile / Right side on Desktop: Level & Toggles */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar pt-1 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/60">
          {/* Level Selector */}
          <div className="relative shrink-0">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Chọn trình độ HSK khảo thí"
              className="h-7 sm:h-8 pl-2 pr-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 appearance-none focus:outline-none cursor-pointer"
            >
              {HSK_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <ChevronDown className="h-2.5 w-2.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle Pills */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowPinyin(!showPinyin)}
              className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl border text-[10px] sm:text-[11px] font-semibold transition-all flex items-center gap-1 ${
                showPinyin
                  ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900/60 dark:text-rose-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Bật/Tắt Pinyin"
            >
              <Languages className="h-3 w-3" />
              <span>Pinyin</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTranslation(!showTranslation)}
              className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-xl border text-[10px] sm:text-[11px] font-semibold transition-all flex items-center gap-1 ${
                showTranslation
                  ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-900/60 dark:text-rose-300"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Bật/Tắt dịch nghĩa"
            >
              <span>Dịch</span>
            </button>

            {/* Speed switch */}
            <button
              type="button"
              onClick={() => {
                const next = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.1 : 0.95;
                setPlaybackSpeed(next);
              }}
              className="h-7 sm:h-8 px-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              title="Tốc độ đọc câu"
            >
              {playbackSpeed}x
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={handleRestartChat}
              className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Bắt đầu lại cuộc trò chuyện"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. CHAT STREAM (Fluid, spacious, responsive on mobile & desktop)     */}
      {/* ==================================================================== */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 space-y-3.5 sm:space-y-5 bg-slate-50/50 dark:bg-slate-950/50"
      >
        {/* Subtle Welcome Strip (Dismissible) */}
        {showIntroBanner && (
          <div className="rounded-2xl bg-gradient-to-r from-rose-50/80 via-white to-rose-50/80 dark:from-rose-950/20 dark:via-slate-900 dark:to-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
              <div className="h-5 w-5 rounded-lg overflow-hidden shrink-0 border border-emerald-500/40 shadow-2xs">
                <img src="/icon.svg" alt="AI HSK" className="w-full h-full object-contain" />
              </div>
              <span className="font-semibold text-rose-700 dark:text-rose-300 shrink-0 text-[11px] sm:text-xs">
                {currentPersona.name}:
              </span>
              <p className="truncate text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                {currentPersona.description} Cứ nói tự nhiên, không áp lực điểm số nhé!
              </p>
            </div>
            <button
              onClick={() => setShowIntroBanner(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 shrink-0"
              title="Đóng thông báo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg, index) => {
          const isAI = msg.role === "assistant";
          const isLatestAI = isAI && index === messages.length - 1;

          return (
            <div key={index} className="space-y-2">
              {isAI ? (
                /* AI PARTNER MESSAGE BUBBLE */
                <div className="flex items-start gap-2.5 sm:gap-3 max-w-[96%] sm:max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {/* Brand HSK Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-emerald-500/60 ring-2 ring-emerald-400/25 bg-emerald-50/20 dark:bg-emerald-950/30">
                      <img src="/icon.svg" alt="AI HSK" className="w-full h-full object-contain" />
                    </div>
                    {isLatestAI && isSpeaking && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                      </span>
                    )}
                  </div>

                  {/* AI Bubble Card */}
                  <div className="flex-1 min-w-0 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
                    {/* Header line: Name + Role + Audio Controls */}
                    <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {currentPersona.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                          &bull; {currentPersona.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Audio Speak Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeaking) {
                              stopTTS();
                            } else {
                              speakText(msg.content);
                            }
                          }}
                          className={`h-6 px-2 text-[10px] font-semibold rounded-md flex items-center gap-1 transition-all ${
                            isSpeaking
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          }`}
                          title={isSpeaking ? "Dừng đọc" : "Nghe phát âm chuẩn"}
                        >
                          {isSpeaking ? (
                            <>
                              <Square className="h-2.5 w-2.5 fill-current animate-pulse text-rose-600" />
                              <span>Dừng</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3 w-3" />
                              <span>Nghe</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chinese Hanzi Text */}
                    <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed font-sans tracking-wide">
                      {msg.content}
                    </p>

                    {/* Pinyin (Calm neutral color) */}
                    {showPinyin && msg.pinyin && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans tracking-wide leading-relaxed">
                        {msg.pinyin}
                      </p>
                    )}

                    {/* Vietnamese Translation */}
                    {showTranslation && msg.translation && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                        {msg.translation}
                      </p>
                    )}

                    {/* Linguistic Tip / Helpful Grammar Note */}
                    {msg.tip && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{msg.tip}</span>
                      </div>
                    )}

                    {/* Interactive Suggestion Chips (Horizontal Swipe on Mobile, Flex on Desktop) */}
                    {isLatestAI && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>Gợi ý phản xạ (Chạm để gửi):</span>
                          <span className="text-[9px] text-slate-400 font-normal md:hidden">Vuốt sang &rarr;</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-0.5 px-0.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug.zh)}
                              className="text-left px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/70 dark:hover:bg-rose-950/40 border border-slate-200/80 hover:border-rose-300 dark:border-slate-700/60 dark:hover:border-rose-900/60 transition-all shadow-2xs group cursor-pointer shrink-0 max-w-[240px] sm:max-w-xs"
                            >
                              <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                                {sug.zh}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {sug.vi}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* USER MESSAGE BUBBLE */
                <div className="flex flex-col items-end space-y-1 ml-auto max-w-[92%] sm:max-w-[80%] animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <span className="text-[10px] font-semibold text-slate-400 px-1">
                    Bạn
                  </span>
                  <div className="rounded-2xl rounded-tr-xs px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-xs">
                    <p className="font-medium text-sm sm:text-base leading-relaxed tracking-wide">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isLoadingReply && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2 animate-in fade-in">
            <div className="relative h-6 w-6 rounded-lg overflow-hidden shrink-0 border border-emerald-500/40 shadow-2xs">
              <img src="/icon.svg" alt="AI HSK" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <Loader2 className="h-3 w-3 animate-spin text-white" />
              </div>
            </div>
            <span>{currentPersona.name} đang suy nghĩ câu trả lời...</span>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. BOTTOM INTERACTION CONSOLE (Thumb-friendly & Responsive)          */}
      {/* ==================================================================== */}
      <footer className="border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 sm:px-6 sm:py-3 shrink-0 z-20">
        <div className="max-w-2xl mx-auto">
          {inputMode === "voice" ? (
            /* VOICE MODE */
            <div className="flex flex-col items-center space-y-2">
              {/* Interim Live Transcript Preview Bubble */}
              {learnerInput && (
                <div className="w-full max-w-lg rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 px-3 py-2 flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {learnerInput}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setLearnerInput("")}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa câu nhận diện"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                    {!isRecording && (
                      <Button
                        size="sm"
                        onClick={() => handleSendMessage()}
                        disabled={isLoadingReply}
                        className="h-6 px-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg gap-1 shadow-xs"
                      >
                        <span>Gửi</span>
                        <Send className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Main Interactive Mic Console */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
                {/* Switch to Keyboard */}
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("text");
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  title="Chuyển sang gõ phím"
                >
                  <Keyboard className="h-4 w-4 text-slate-500" />
                  <span className="hidden sm:inline">Gõ phím</span>
                </button>

                {/* Central Glowing Mic Orb (Responsive 54px mobile, 64px desktop) */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isLoadingReply}
                    className="relative group focus:outline-none"
                    title="Bấm vào để nói tiếng Trung"
                  >
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <Mic className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="relative group focus:outline-none"
                    title="Bấm để dừng ghi âm"
                  >
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/40 animate-pulse cursor-pointer">
                      <Square className="h-5 w-5 fill-current" />
                    </div>
                  </button>
                )}

                {/* Fast Tips Hint */}
                <button
                  type="button"
                  onClick={() => {
                    const sample = currentPersona.initialSuggestions[0]?.zh;
                    if (sample) handleSendMessage(sample);
                  }}
                  className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  title="Gửi câu chào mẫu nhanh"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="hidden sm:inline">Câu mẫu</span>
                </button>
              </div>

              {/* Status Hint */}
              <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                {isRecording ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1.5 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    Đang nghe... ({recordingSeconds}s) &bull; Bấm lại để gửi
                  </span>
                ) : (
                  <span>Chạm Micro để bắt đầu nói</span>
                )}
              </div>
            </div>
          ) : (
            /* TEXT MODE */
            <div className="space-y-1.5">
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-2 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all flex items-end gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setInputMode("voice")}
                  className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl shrink-0"
                  title="Chuyển về Micro"
                >
                  <Mic className="h-4 w-4" />
                </Button>

                <textarea
                  ref={textareaRef}
                  value={learnerInput}
                  onChange={(e) => setLearnerInput(e.target.value)}
                  disabled={isLoadingReply}
                  placeholder="Gõ tiếng Trung hoặc Pinyin..."
                  rows={1}
                  className="flex-1 border-0 bg-transparent p-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-medium max-h-20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <Button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!learnerInput.trim() || isLoadingReply}
                  className={`h-8 w-8 p-0 rounded-xl font-bold flex items-center justify-center shrink-0 transition-all ${
                    learnerInput.trim()
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                  }`}
                  title="Gửi"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 px-1">
                <span>Enter để gửi &bull; Shift + Enter xuống dòng</span>
                <button
                  type="button"
                  onClick={() => setInputMode("voice")}
                  className="text-rose-600 font-semibold hover:underline"
                >
                  Quay lại Micro
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 4. EVALUATION & SUMMARY MODAL                                        */}
      {/* ==================================================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="max-w-xl w-full max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center shadow-xs">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Báo Cáo Đánh Giá Khẩu Ngữ Tự Do
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phản xạ tự nhiên cùng {currentPersona.name} ({userTurnCount} câu đã giao tiếp)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSummaryModal(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
              {isEvaluating ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Giám khảo AI đang phân tích toàn diện cuộc trò chuyện...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Rà soát ngữ pháp, độ đa dạng từ vựng, tính tự nhiên và đối chiếu chuẩn HSK.
                  </p>
                </div>
              ) : evaluationResult ? (
                <>
                  {/* Overall Score Banner */}
                  <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">
                          Điểm Khẩu Ngữ Đạt Được
                        </span>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] font-bold">
                          Ước lượng {evaluationResult.hskEstimate}
                        </Badge>
                      </div>
                      <p className="text-xs text-rose-100 leading-relaxed max-w-sm pt-0.5">
                        {evaluationResult.summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
                      <span className="text-3xl sm:text-4xl font-black">{evaluationResult.overallScore}</span>
                      <span className="text-xs text-rose-200 block font-semibold">/ 100</span>
                    </div>
                  </div>

                  {/* 3 Skill Dimension Bars */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-rose-600" />
                      <span>3 Trụ Cột Năng Lực Khẩu Ngữ</span>
                    </h4>

                    {/* Fluency */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>Độ Lưu Loát & Phản Xạ Tự Nhiên</span>
                        <span className="font-bold text-rose-600">{evaluationResult.fluencyScore} / 100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-600 rounded-full transition-all duration-500"
                          style={{ width: `${evaluationResult.fluencyScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Grammar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>Độ Chuẩn Ngữ Pháp & Cấu Trúc Câu</span>
                        <span className="font-bold text-indigo-600">{evaluationResult.grammarScore} / 100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${evaluationResult.grammarScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Vocabulary */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>Vốn Từ Vựng & Diễn Đạt Bản Xứ</span>
                        <span className="font-bold text-emerald-600">{evaluationResult.vocabularyScore} / 100</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${evaluationResult.vocabularyScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  {evaluationResult.strengths?.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Điểm Sáng Bạn Đã Thể Hiện Tốt:</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-5 list-disc text-[11px]">
                        {evaluationResult.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Native Phrasing / Corrections */}
                  {evaluationResult.corrections?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        <span>Gợi Ý Sửa Câu Chuẩn Bản Xứ:</span>
                      </h4>

                      <div className="space-y-2">
                        {evaluationResult.corrections.map((corr, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400">Bạn nói:</span>
                              <span className="text-rose-600 dark:text-rose-400 font-medium line-through">
                                {corr.original}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-emerald-600">Nên nói:</span>
                              <span className="text-slate-900 dark:text-white font-bold">
                                {corr.correction}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                              {corr.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extension Practice Questions Bank (Bộ câu hỏi luyện tập mở rộng sau báo cáo) */}
                  {evaluationResult.extensionQuestions && evaluationResult.extensionQuestions.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                            <span>Bộ Câu Hỏi Luyện Tập Mở Rộng Sau Báo Cáo</span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            5 câu hỏi tiếp nối thiết kế riêng theo phong cách của {activePersona.name}:
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {evaluationResult.extensionQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5 ml-auto">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => speakText(q.zh, 0.95)}
                                  className="h-6 px-2 text-[10px] text-slate-500 hover:text-rose-600 rounded-md gap-1"
                                  title="Nghe phát âm câu hỏi"
                                >
                                  <Volume2 className="h-3 w-3" />
                                  <span>Phát âm</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    setInputValue(q.zh);
                                    setShowSummaryModal(false);
                                  }}
                                  className="h-6 px-2.5 text-[10px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-lg font-semibold gap-1"
                                >
                                  <MessageSquare className="h-2.5 w-2.5" />
                                  <span>Hỏi AI ngay</span>
                                </Button>
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {q.zh}
                            </p>
                            {q.pinyin && (
                              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-sans">
                                {q.pinyin}
                              </p>
                            )}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              Dịch nghĩa: &quot;{q.vi}&quot;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              {savedSessionId && (
                <Link href={`/dashboard/reports/${savedSessionId}`} className="w-full sm:flex-1">
                  <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-10 font-bold gap-1.5 shadow-xs">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Xem Báo Cáo Chi Tiết</span>
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                onClick={() => setShowSummaryModal(false)}
                className="w-full sm:flex-1 text-xs h-10 rounded-xl font-semibold border-slate-200 dark:border-slate-700"
              >
                Tiếp tục trò chuyện
              </Button>

              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto text-xs h-10 rounded-xl font-semibold text-slate-600 dark:text-slate-400"
                >
                  Về Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
