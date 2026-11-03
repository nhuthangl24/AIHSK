"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SoundWave } from "@/components/ui/sound-wave";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
  Languages,
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

export default function AssessmentExamRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voice & Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState(false);
  const [learnerTranscript, setLearnerTranscript] = useState("");
  const [showPinyin, setShowPinyin] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch initial session details
  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/assessments/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load session");

      setSession(data.session);

      if (data.session.status === "COMPLETED") {
        router.push(`/dashboard/reports/${id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load assessment room");
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
    };
  }, [id]);

  // Auto-scroll chat to latest turn
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [session?.turns, learnerTranscript]);

  // Play Examiner Voice using Web Speech Synthesis
  const speakExaminerText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.95; // Natural deliberate cadence for language exam
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsExaminerSpeaking(true);
    utterance.onend = () => setIsExaminerSpeaking(false);
    utterance.onerror = () => setIsExaminerSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

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

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Web Speech Recognition is not supported by your browser. You can type your Chinese response directly below."
      );
      setIsRecording(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
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
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsRecording(true);
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
  };

  // Submit Spoken Learner Turn
  const handleSubmitTurn = async () => {
    if (!learnerTranscript.trim() || isSubmittingTurn) return;

    stopRecording();
    setIsSubmittingTurn(true);

    try {
      const res = await fetch(`/api/assessments/${id}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: learnerTranscript.trim(),
          durationMs: 12000,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Turn submission failed");

      setLearnerTranscript("");

      if (data.isCompleted) {
        setIsFinalizing(true);
        // Poll for completion
        const pollInterval = setInterval(async () => {
          const pollRes = await fetch(`/api/assessments/${id}`);
          const pollData = await pollRes.json();
          if (pollData.session?.status === "COMPLETED") {
            clearInterval(pollInterval);
            router.push(`/dashboard/reports/${id}`);
          }
        }, 1200);
      } else {
        await fetchSession();
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit response");
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-sm text-slate-500 font-medium">Entering Oral Examination Room...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto p-6 rounded-2xl bg-white border border-rose-200 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Unable to load examination</h2>
        <p className="text-xs text-slate-500">{error || "Session not found"}</p>
        <Button onClick={() => router.push("/dashboard/assessments")}>Return to Assessments</Button>
      </div>
    );
  }

  const latestExaminerTurn = [...session.turns].reverse().find((t) => t.speaker === "EXAMINER");

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Stage Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cinnabar" className="text-xs">
              {session.template.targetLevel}
            </Badge>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {session.template.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard Oral Proficiency Examination &bull; 5-Stage Conversational Protocol
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Clock className="h-4 w-4 text-rose-600" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mic Ready</span>
          </div>
        </div>
      </div>

      {/* 5-Stage Stepper Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { num: 1, name: "Warm-up", zh: "问候导入" },
          { num: 2, name: "Daily Life", zh: "日常交流" },
          { num: 3, name: "Topic Discourse", zh: "主题阐述" },
          { num: 4, name: "Probing", zh: "深入追问" },
          { num: 5, name: "Wrap-up", zh: "考试总结" },
        ].map((st) => {
          const isCurrent = session.currentStage === st.num;
          const isPassed = session.currentStage > st.num;

          return (
            <div
              key={st.num}
              className={`p-2.5 rounded-xl border text-center transition-colors ${
                isCurrent
                  ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 shadow-sm"
                  : isPassed
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                  : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-400"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">Stage {st.num}</div>
              <div className="text-xs font-semibold truncate">{st.name}</div>
              <div className="text-[10px] opacity-75">{st.zh}</div>
            </div>
          );
        })}
      </div>

      {/* Central Assessment Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Examiner Focal Stage Card (Left 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Examiner Identity */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold text-xl border-2 border-rose-500 shadow-sm">
                      李
                    </div>
                    {isExaminerSpeaking && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>考官李老师 (Examiner Li)</span>
                      <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-600">
                        Senior Examiner
                      </Badge>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard Mandarin &bull; Stage {session.currentStage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPinyin(!showPinyin)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                    title="Toggle Pinyin"
                  >
                    <Languages className="h-4 w-4 mr-1" />
                    <span>{showPinyin ? "Hide Pinyin" : "Show Pinyin"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (latestExaminerTurn) speakExaminerText(latestExaminerTurn.textContent);
                    }}
                    title="Replay Examiner Voice"
                  >
                    <Volume2 className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Examiner's Spoken Text Display */}
              <div className="min-h-[140px] flex flex-col justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Examiner Question &bull; 考官发问
                </span>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                  {latestExaminerTurn?.textContent || "你好！请问你准备好了吗？"}
                </p>
                {showPinyin && latestExaminerTurn?.pinyinContent && (
                  <p className="text-xs sm:text-sm text-slate-500 italic leading-relaxed pt-1">
                    {latestExaminerTurn.pinyinContent}
                  </p>
                )}
              </div>

              {/* Live Audio Visualizer */}
              <div className="flex items-center justify-between px-2 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  {isExaminerSpeaking ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="font-medium text-rose-600">Examiner is speaking...</span>
                    </>
                  ) : (
                    <span>Examiner waiting for your spoken response</span>
                  )}
                </span>
                <SoundWave isActive={isExaminerSpeaking} color="cinnabar" size="md" />
              </div>
            </CardContent>
          </Card>

          {/* Learner Speech Response Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="h-4 w-4 text-rose-600" />
                  <span>Your Spoken Response (考生应答)</span>
                </span>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                    Recording Live...
                  </span>
                )}
              </div>

              {/* Spoken Text Input / Live Transcript Box */}
              <div className="relative">
                <textarea
                  value={learnerTranscript}
                  onChange={(e) => setLearnerTranscript(e.target.value)}
                  placeholder={
                    isRecording
                      ? "Listening to your Mandarin voice... Speak clearly into the microphone."
                      : "Click 'Start Speaking' or type your response in Chinese..."
                  }
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white transition-all leading-relaxed"
                />
              </div>

              {/* Recording Controls & Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={isSubmittingTurn}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-sm text-xs h-10 px-5"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Start Speaking (开始录音)</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-2 text-xs h-10 px-5"
                    >
                      <MicOff className="h-4 w-4" />
                      <span>Stop Recording (停止录音)</span>
                    </Button>
                  )}

                  {learnerTranscript && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLearnerTranscript("")}
                      className="text-xs text-slate-500"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleSubmitTurn}
                  disabled={!learnerTranscript.trim() || isSubmittingTurn}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs h-10 px-6 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmittingTurn ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing Response...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Turn (提交回答)</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Dialogue Transcript (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[600px] rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Examination Transcript Stream
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">
              {session.turns.length} Turn(s) Completed
            </span>
          </div>

          <div
            ref={chatScrollRef}
            className="flex-1 p-4 space-y-4 overflow-y-auto text-xs leading-relaxed"
          >
            {session.turns.map((turn, i) => {
              const isExaminer = turn.speaker === "EXAMINER";
              return (
                <div
                  key={i}
                  className={`flex flex-col space-y-1.5 ${
                    isExaminer ? "items-start" : "items-end"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isExaminer ? "考官 Examiner" : "考生 Learner"} &bull; Stage {turn.stage}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      isExaminer
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white rounded-tl-sm"
                        : "bg-rose-600 text-white rounded-tr-sm shadow-sm"
                    }`}
                  >
                    <p className="font-medium">{turn.textContent}</p>
                    {isExaminer && showPinyin && turn.pinyinContent && (
                      <p className="text-[10px] opacity-70 mt-1 italic">{turn.pinyinContent}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Audio & transcript persisted</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Encrypted Session
            </span>
          </div>
        </div>
      </div>

      {/* Finalizing Overlay Modal */}
      {isFinalizing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center space-y-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Oral Assessment Concluded!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The psychometric scoring engine is evaluating your complete 5-stage conversation across all 7 dimensions...
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Transcript finalized & verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Tone sandhi & acoustic contours extracted</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                <span>Generating multi-dimensional report...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
