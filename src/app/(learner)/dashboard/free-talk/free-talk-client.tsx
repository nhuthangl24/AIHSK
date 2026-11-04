"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SoundWave } from "@/components/ui/sound-wave";
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  Send,
  Languages,
  RotateCcw,
  Lightbulb,
  Keyboard,
  ArrowLeft,
  Settings,
  Smile,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  X,
  Award,
  ChevronRight,
  BarChart3,
  ThumbsUp,
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto space-y-3 pb-2">
      {/* ==================================================================== */}
      {/* 1. TOP BAR: Persona Selector & Level Settings                        */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        {/* Left: Persona Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:inline shrink-0 mr-1">
            Bạn trò chuyện:
          </span>
          {Object.values(FREE_TALK_PERSONAS).map((p) => {
            const isSelected = p.id === selectedPersonaId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPersona(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-xs scale-102"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-lg bg-gradient-to-br ${p.avatarColor} text-white flex items-center justify-center text-[10px] font-serif`}
                >
                  {p.avatarText}
                </div>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Level dropdown & Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {HSK_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={handleEvaluateSession}
            disabled={isEvaluating}
            className="h-8 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            title="Kết thúc và xem bảng điểm AI đánh giá chi tiết"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang chấm điểm...</span>
              </>
            ) : (
              <>
                <Award className="h-3.5 w-3.5" />
                <span>Kết Thúc & Chấm Điểm ({userTurnCount})</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. CHAT STREAM (Generous, conversational, no rigid exam pressure)    */}
      {/* ==================================================================== */}
      <div
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 py-2 space-y-4 rounded-2xl bg-gradient-to-b from-slate-50/70 via-white to-slate-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-inner"
      >
        {/* Intro Banner */}
        <div className="rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 p-3 sm:p-4 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
            <Smile className="h-4 w-4" />
            <span>Phòng Trò Chuyện Tự Do &bull; Không Áp Lực Điểm Số</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Bạn có thể thoải mái tán gẫu về bất kỳ điều gì (ăn uống, thời tiết, sở thích, phim ảnh, kể chuyện...). Cứ nói tự nhiên, không sợ sai nhé!
          </p>
        </div>

        {/* Messages List */}
        {messages.map((msg, index) => {
          const isAI = msg.role === "assistant";
          const isLatestAI = isAI && index === messages.length - 1;

          return (
            <div key={index} className="space-y-2">
              {isAI ? (
                /* AI PARTNER MESSAGE BUBBLE */
                <div className="flex items-start gap-2.5 sm:gap-3 max-w-[94%] sm:max-w-[85%]">
                  <div
                    className={`h-9 w-9 rounded-2xl bg-gradient-to-br ${currentPersona.avatarColor} text-white flex items-center justify-center font-bold text-sm font-serif shadow-xs shrink-0 mt-0.5`}
                  >
                    {currentPersona.avatarText}
                  </div>

                  <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2 flex-1">
                    {/* Header line: Partner name + controls */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {currentPersona.name}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Speed switch */}
                        <button
                          type="button"
                          onClick={() => {
                            const next = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.05 : 0.95;
                            setPlaybackSpeed(next);
                            speakText(msg.content, next);
                          }}
                          className="h-6 px-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                          title="Tốc độ đọc"
                        >
                          {playbackSpeed}x
                        </button>

                        {/* Pinyin toggle */}
                        <button
                          type="button"
                          onClick={() => setShowPinyin(!showPinyin)}
                          className="h-6 px-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                          title="Bật/Tắt Pinyin"
                        >
                          <Languages className="h-3 w-3" />
                          <span>{showPinyin ? "Pinyin" : "Ẩn"}</span>
                        </button>

                        {/* Translation toggle */}
                        <button
                          type="button"
                          onClick={() => setShowTranslation(!showTranslation)}
                          className="h-6 px-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Bật/Tắt dịch nghĩa tiếng Việt"
                        >
                          <span>{showTranslation ? "Dịch" : "Ẩn dịch"}</span>
                        </button>

                        {/* Voice Listen Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(msg.content)}
                          className="h-6 px-2 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md gap-1"
                          title="Nghe phát âm"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>Nghe</span>
                        </Button>
                      </div>
                    </div>

                    {/* Chinese Hanzi Text */}
                    <p className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed tracking-wide">
                      {msg.content}
                    </p>

                    {/* Pinyin */}
                    {showPinyin && msg.pinyin && (
                      <p className="text-xs sm:text-sm text-rose-600/90 dark:text-rose-400 font-sans tracking-wide leading-relaxed">
                        {msg.pinyin}
                      </p>
                    )}

                    {/* Vietnamese Translation */}
                    {showTranslation && msg.translation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800/60">
                        🇻🇳 {msg.translation}
                      </p>
                    )}

                    {/* Gentle Linguistic Tip / Grammar correction */}
                    {msg.tip && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{msg.tip}</span>
                      </div>
                    )}

                    {/* Suggested Replies Chips (Only on Latest Message) */}
                    {isLatestAI && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          💡 Gợi ý câu bạn có thể trả lời (Chạm để gửi):
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug.zh)}
                              className="text-left p-2 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800/60 dark:hover:bg-rose-950/40 border border-slate-200/70 hover:border-rose-300 dark:border-slate-700/60 dark:hover:border-rose-900/60 transition-all group"
                            >
                              <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                                {sug.zh}
                              </div>
                              <div className="text-[10px] text-slate-500 line-clamp-1">
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
                <div className="flex flex-col items-end space-y-1 ml-auto max-w-[92%] sm:max-w-[80%]">
                  <span className="text-[10px] font-semibold text-slate-400 px-1">
                    Bạn
                  </span>
                  <div className="rounded-2xl rounded-tr-xs p-3.5 bg-rose-600 text-white shadow-xs">
                    <p className="font-medium text-sm sm:text-base leading-relaxed tracking-wide">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoadingReply && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
            <span>{currentPersona.name} đang suy nghĩ câu trả lời...</span>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 3. BOTTOM INTERACTION CONSOLE (Speech & Keyboard)                   */}
      {/* ==================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 shadow-xs space-y-2 shrink-0">
        {inputMode === "voice" ? (
          /* VOICE MODE */
          <div className="space-y-2">
            {learnerInput && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-2.5 flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {learnerInput}
                </span>
                <button
                  onClick={() => setLearnerInput("")}
                  className="text-xs text-slate-400 hover:text-rose-600 shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isLoadingReply}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Mic className="h-4 w-4" />
                  <span>{learnerInput ? "Nói thêm vào câu" : "Bấm Micro để nói (Bắt đầu nói)"}</span>
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm h-11 rounded-xl flex items-center justify-center gap-2 shadow-xs animate-pulse transition-all"
                >
                  <MicOff className="h-4 w-4" />
                  <span>Dừng nói ({recordingSeconds}s)</span>
                </Button>
              )}

              {learnerInput && !isRecording && (
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoadingReply}
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 font-bold text-xs sm:text-sm h-11 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs shrink-0 transition-all"
                >
                  <span>Gửi</span>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setInputMode("text");
                  setTimeout(() => textareaRef.current?.focus(), 100);
                }}
                className="h-11 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shrink-0"
                title="Gõ phím tiếng Trung"
              >
                <Keyboard className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Bàn phím</span>
              </Button>
            </div>
          </div>
        ) : (
          /* TEXT MODE */
          <div className="space-y-2">
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 p-2.5 focus-within:ring-2 focus-within:ring-rose-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
              <textarea
                ref={textareaRef}
                value={learnerInput}
                onChange={(e) => setLearnerInput(e.target.value)}
                disabled={isLoadingReply}
                placeholder="Gõ bất kỳ điều gì bạn muốn nói bằng tiếng Trung..."
                rows={2}
                className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed font-medium"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputMode("voice")}
                className="h-8 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg gap-1"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Chuyển sang Micro</span>
              </Button>

              <Button
                onClick={() => handleSendMessage()}
                disabled={!learnerInput.trim() || isLoadingReply}
                className={`h-8 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  learnerInput.trim()
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                    : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                }`}
              >
                <span>Gửi</span>
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 4. EVALUATION & SUMMARY MODAL                                        */}
      {/* ==================================================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="max-w-xl w-full max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Bảng Đánh Giá & Chấm Điểm Khẩu Ngữ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phân tích phản xạ cùng {currentPersona.name} ({userTurnCount} câu đã nói)
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSummaryModal(false)}
                className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-xl"
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
                    Giám khảo AI đang chấm điểm khẩu ngữ...
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Đang rà soát ngữ pháp, từ vựng, độ trôi chảy và đối chiếu chuẩn HSK.
                  </p>
                </div>
              ) : evaluationResult ? (
                <>
                  {/* Overall Score Banner */}
                  <div className="rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100">
                          Điểm Khẩu Ngữ Tự Do
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
                      <span>3 Trụ Cột Đánh Giá Khẩu Ngữ</span>
                    </h4>

                    {/* Fluency */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>Độ Lưu Loát & Phản Xạ</span>
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
                        <span>Độ Chuẩn Ngữ Pháp & Cấu Trúc</span>
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
                        <span>Vốn Từ Vựng & Diễn Đạt Tự Nhiên</span>
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
                        <span>Điểm Sáng Bạn Đã Làm Tốt:</span>
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
