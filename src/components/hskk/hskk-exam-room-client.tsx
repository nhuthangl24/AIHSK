"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SoundWave } from "@/components/ui/sound-wave";
import {
  HskkExamTemplate,
  HskkSession,
  HskkQuestion,
  HskkResult,
} from "@/types/hskk";
import { hskkAudio } from "@/lib/audio/hskk-audio";
import {
  getSystemAudioSettings,
  saveSystemAudioSettings,
  getAvailableChineseVoices,
  SystemAudioSettings,
  FIXED_VOICE_NAME,
  FIXED_VOICE_LABEL,
} from "@/lib/audio/system-audio-settings";
import {
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Award,
  FileText,
  Eye,
  EyeOff,
  Square,
  Check,
  Flame,
  Settings,
  X,
  Languages,
  ArrowLeft,
  ZoomIn,
  Radio,
  Play,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { formatScore, formatDate } from "@/lib/utils";

type ExamPhase =
  | "INITIAL_CHECK"
  | "OPENING_ANNOUNCEMENT"
  | "PLAYING_PROMPT"
  | "PREPARING"
  | "RECORDING"
  | "SUBMITTING"
  | "RESULT";

export function HskkExamRoomClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  // Core Data
  const [session, setSession] = useState<HskkSession | null>(null);
  const [template, setTemplate] = useState<HskkExamTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Exam Flow States
  const [phase, setPhase] = useState<ExamPhase>("INITIAL_CHECK");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(0);
  const [speakingSecondsLeft, setSpeakingSecondsLeft] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);

  // Modals
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  // Audio & Hardware Settings
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(FIXED_VOICE_NAME);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.95);
  const [recognitionLang, setRecognitionLang] = useState("zh-TW");

  // Live Hardware Testing & Visualizer
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [recordingVolume, setRecordingVolume] = useState(0);

  // Speech Recognition & Results
  const [learnerTranscript, setLearnerTranscript] = useState("");
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [finalResult, setFinalResult] = useState<HskkResult | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 1. Initial Load & Sync
  useEffect(() => {
    const sys = getSystemAudioSettings();
    setSelectedVoiceName(FIXED_VOICE_NAME);
    setPlaybackSpeed(sys.playbackSpeed || 0.95);
    setRecognitionLang(sys.recognitionLang || "zh-TW");
    setShowPinyin(typeof sys.showPinyin === "boolean" ? sys.showPinyin : true);

    const loadVoices = () => {
      setAvailableVoices(getAvailableChineseVoices());
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }

    const onSettingsChanged = (e: any) => {
      const updated: SystemAudioSettings = e.detail || getSystemAudioSettings();
      setSelectedVoiceName(FIXED_VOICE_NAME);
      if (typeof updated.playbackSpeed === "number") setPlaybackSpeed(updated.playbackSpeed);
      if (updated.recognitionLang) setRecognitionLang(updated.recognitionLang);
      if (typeof updated.showPinyin === "boolean") setShowPinyin(updated.showPinyin);
    };
    window.addEventListener("aihsk_audio_settings_changed", onSettingsChanged);

    async function loadData() {
      try {
        setIsLoading(true);

        // Check local backup snapshot
        let localSnapshot: any = null;
        try {
          const cached = localStorage.getItem(`aihsk_hskk_sess_${sessionId}`);
          if (cached) localSnapshot = JSON.parse(cached);
        } catch {}

        const res = await fetch(`/api/hskk/sessions/${sessionId}`);
        const data = await res.json();

        if (data.success && data.session && data.template) {
          setSession(data.session);
          setTemplate(data.template);

          try {
            localStorage.setItem(`aihsk_hskk_sess_${sessionId}`, JSON.stringify(data.session));
          } catch {}

          if (data.session.status === "COMPLETED" && data.session.result) {
            setFinalResult(data.session.result);
            setPhase("RESULT");
          }
          return;
        }

        // Fallback: If server returned an error but we have local backup snapshot, recover smoothly!
        if (localSnapshot && localSnapshot.templateId) {
          setSession(localSnapshot);
          const tRes = await fetch("/api/hskk/templates");
          const tData = await tRes.json();
          if (tData.templates) {
            const found = tData.templates.find((t: any) => t.id === localSnapshot.templateId) || tData.templates[1];
            setTemplate(found);
            return;
          }
        }

        setErrorMsg(data.error || "Không tìm thấy phòng thi HSKK.");
      } catch (err: any) {
        setErrorMsg(err.message || "Lỗi tải thông tin phòng thi.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      }
      hskkAudio.stopSpeaking();
      stopMicListening();
      window.removeEventListener("aihsk_audio_settings_changed", onSettingsChanged);
    };
  }, [sessionId]);

  // Clean up Mic & Audio Context
  const stopMicListening = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (micAudioCtxRef.current && micAudioCtxRef.current.state !== "closed") {
      micAudioCtxRef.current.close().catch(() => null);
      micAudioCtxRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setMicVolumeLevel(0);
    setRecordingVolume(0);
  };

  // Start live volume monitoring during recording
  const startRecordingVolumeMonitor = async () => {
    try {
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      micAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(micStreamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 120) * 100));
        setRecordingVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch {
      // AudioContext volume monitor fallback
    }
  };

  // 2. Hardware Checks
  const handleTestAudio = async () => {
    setIsTestingAudio(true);
    await hskkAudio.playPromptBeep(1000, 350);
    hskkAudio.speakChinese("欢迎参加汉语水平口语考试。耳机测试正常。", {
      rate: playbackSpeed,
      voiceName: selectedVoiceName,
      onEnd: () => setIsTestingAudio(false),
      onError: () => setIsTestingAudio(false),
    });
  };

  const handleTestMic = async () => {
    try {
      if (isTestingMic) {
        stopMicListening();
        setIsTestingMic(false);
        return;
      }

      setIsTestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      micAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        if (micStreamRef.current) {
          animFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
    } catch (e) {
      alert("Không thể truy cập Microphone. Vui lòng cấp quyền micro cho trình duyệt.");
      setIsTestingMic(false);
    }
  };

  // 3. Start Official Exam Sequence
  const handleStartExam = () => {
    stopMicListening();
    setIsTestingMic(false);
    setPhase("OPENING_ANNOUNCEMENT");

    hskkAudio.playSectionChime().then(() => {
      const openText = `欢迎参加汉语水平口语考试。${template?.titleZh || "HSKK考试"}现在开始。全卷共三部分。请仔细听录音，听到提示音后开始作答。`;
      hskkAudio.speakChinese(openText, {
        rate: playbackSpeed,
        voiceName: selectedVoiceName,
        onEnd: () => {
          setTimeout(() => {
            startQuestion(0);
          }, 1200);
        },
      });
    });
  };

  // 4. Question Sequence Execution
  const currentQuestion: HskkQuestion | undefined = template?.questions[currentQIndex];

  const startQuestion = (qIndex: number) => {
    if (!template || qIndex >= template.questions.length) {
      handleSubmitAllAnswers();
      return;
    }

    setCurrentQIndex(qIndex);
    const q = template.questions[qIndex];
    setLearnerTranscript("");
    setRecordingVolume(0);

    // Step A: Play Prompt
    setPhase("PLAYING_PROMPT");
    hskkAudio.stopSpeaking();

    let announcementText = "";
    if (qIndex === 0) {
      announcementText = "第一部分：听后重复。共 10 题。每题听录音后，请在听到提示音后重复一次。现在开始第 1 题。";
    } else if (q.partNumber === 2 && template.questions[qIndex - 1]?.partNumber === 1) {
      announcementText = "第二部分：看图说话。共 2 题。请看试卷上的两幅图，准备时间结束会有提示音，请分别就两幅图进行说明，每题 2 分钟。";
    } else if (q.partNumber === 3 && template.questions[qIndex - 1]?.partNumber === 2) {
      announcementText = "第三部分：回答问题。共 2 题。请回答试卷上的两个问题，每题 2 分钟。";
    }

    const promptToSpeak = announcementText
      ? `${announcementText} ${q.audioPrompt}`
      : `第 ${q.questionIndex} 题。${q.audioPrompt}`;

    hskkAudio.speakChinese(promptToSpeak, {
      rate: playbackSpeed,
      voiceName: selectedVoiceName,
      onEnd: () => {
        if (q.prepTimeSeconds > 0) {
          runPreparationPhase(q);
        } else {
          runRecordingPhase(q);
        }
      },
    });
  };

  // Replay question audio (especially friendly for practice mode)
  const handleReplayPrompt = () => {
    if (!currentQuestion) return;
    hskkAudio.stopSpeaking();
    hskkAudio.speakChinese(currentQuestion.audioPrompt, {
      rate: playbackSpeed,
      voiceName: selectedVoiceName,
    });
  };

  const runPreparationPhase = (q: HskkQuestion) => {
    setPhase("PREPARING");
    setPrepSecondsLeft(q.prepTimeSeconds);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          runRecordingPhase(q);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const runRecordingPhase = async (q: HskkQuestion) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Official HSKK prompt "嘀" (1000Hz beep)
    await hskkAudio.playPromptBeep(1000, 450);

    setPhase("RECORDING");
    setSpeakingSecondsLeft(q.speakingTimeSeconds);
    setIsRecordingActive(true);

    startSpeechRecognition();
    startRecordingVolumeMonitor();

    timerRef.current = setInterval(() => {
      setSpeakingSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishCurrentQuestion(q);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = recognitionLang || "zh-CN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setLearnerTranscript(text);
      };

      recognition.onerror = () => {};
      recognition.onend = () => {};

      recognition.start();
      recognitionRef.current = recognition;
    } catch {}
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecordingActive(false);
  };

  const finishCurrentQuestion = async (q: HskkQuestion) => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopSpeechRecognition();
    stopMicListening();

    await hskkAudio.playEndingBeep();

    const spokenText = learnerTranscript.trim();
    const duration = q.speakingTimeSeconds - speakingSecondsLeft;

    const answerPayload = {
      questionId: q.id,
      partNumber: q.partNumber,
      questionIndex: q.questionIndex,
      transcript: spokenText,
      durationSeconds: duration,
      spokenAt: new Date().toISOString(),
    };

    // Keep session state & localStorage synchronized immediately
    setSession((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        answers: {
          ...prev.answers,
          [q.id]: answerPayload,
        },
      };
      try {
        localStorage.setItem(`aihsk_hskk_sess_${sessionId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    fetch(`/api/hskk/sessions/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: q.id,
        answer: answerPayload,
      }),
    }).catch(() => null);

    setTimeout(() => {
      startQuestion(currentQIndex + 1);
    }, 900);
  };

  const handleFinishEarly = () => {
    if (currentQuestion && phase === "RECORDING") {
      finishCurrentQuestion(currentQuestion);
    }
  };

  // 5. Submit All & Run AI Scoring
  const handleSubmitAllAnswers = async () => {
    setPhase("SUBMITTING");
    hskkAudio.stopSpeaking();
    stopSpeechRecognition();
    stopMicListening();

    try {
      const res = await fetch(`/api/hskk/sessions/${sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: session?.answers }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setFinalResult(data.result);
        setPhase("RESULT");
        hskkAudio.playSectionChime();
      } else {
        setErrorMsg(data.error || "Chấm thi thất bại.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi nộp bài thi.");
    }
  };

  // =========================================================================
  // VIEW 1: LOADING
  // =========================================================================
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 space-y-4 select-none">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border-2 border-rose-500 flex items-center justify-center animate-pulse">
            <Radio className="h-7 w-7 text-rose-500 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <Badge className="bg-rose-950 text-rose-300 border-rose-800 text-xs">
            Khảo Thí Khẩu Ngữ AI &bull; Chuẩn CTI
          </Badge>
          <h2 className="text-lg sm:text-xl font-bold">Đang kết nối phòng thi ảo HSKK...</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Khởi tạo hệ thống âm thanh, kiểm tra băng ghi âm câu hỏi và nạp barem điểm quốc tế.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ERROR
  // =========================================================================
  if (errorMsg || !session || !template) {
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center space-y-4 select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-xl font-bold">Không thể vào phòng thi HSKK</h2>
          <p className="text-xs sm:text-sm text-slate-400">{errorMsg || "Dữ liệu kỳ thi không hợp lệ."}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/hskk">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 h-11 rounded-xl text-xs flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Quay Về Trang HSKK</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: INITIAL HARDWARE & RULES CHECK (Thân thiện, rõ ràng, dễ thao tác)
  // =========================================================================
  if (phase === "INITIAL_CHECK") {
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col select-none overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/hskk">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2 -ml-2 rounded-lg text-xs"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Thoát</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <span className="text-rose-500">Classnia</span> HSKK
            </span>
            <Badge className="bg-rose-950/80 text-rose-300 border-rose-800 text-[10px] hidden sm:inline-flex">
              {template.titleZh}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:inline">SBD:</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-rose-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              {session.candidateNumber}
            </span>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col items-center">
          <div className="w-full max-w-2xl my-auto space-y-5">
            {/* Friendly Greeting Banner */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-1">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                <span>Phòng Chuẩn Bị &bull; Chuẩn Khảo Thí CTI 2024</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Chào mừng bạn đến phòng thi HSKK
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Hãy kiểm tra tai nghe và micro để tự tin đạt điểm cao nhất. Giữ tâm lý thoải mái và phát biểu tự nhiên nhé!
              </p>
            </div>

            {/* 3 Steps Setup Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Step 1: Tai nghe */}
              <Card className="bg-slate-800/50 border-slate-700/60 p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">1. Kiểm Tra Tai Nghe</h3>
                    <p className="text-[11px] text-slate-400">Nghe thử tiếng bíp &lsquo;嘀&rsquo; và giọng đọc</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleTestAudio}
                  disabled={isTestingAudio}
                  className="w-full bg-slate-700/60 hover:bg-slate-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 border border-slate-600/60"
                >
                  <Volume2 className="h-4 w-4 text-blue-400" />
                  <span>{isTestingAudio ? "Đang phát âm thanh mẫu..." : "Phát Thử Âm Thanh"}</span>
                </Button>
              </Card>

              {/* Step 2: Micro */}
              <Card className="bg-slate-800/50 border-slate-700/60 p-4 sm:p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">2. Kiểm Tra Microphone</h3>
                    <p className="text-[11px] text-slate-400">Nói thử để kiểm tra độ nhạy thu âm</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleTestMic}
                    className={`w-full font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      isTestingMic
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/30"
                        : "bg-slate-700/60 hover:bg-slate-700 text-white border border-slate-600/60"
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                    <span>{isTestingMic ? "Đang lắng nghe... (Bấm dừng)" : "Thử Micro Của Bạn"}</span>
                  </Button>
                  {isTestingMic && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-75"
                          style={{ width: `${Math.max(micVolumeLevel, 5)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium block text-center">
                        {micVolumeLevel > 15 ? "✓ Micro nhận diện âm thanh rất tốt!" : "Hãy nói to hơn một chút vào micro..."}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Step 3: Tùy chỉnh tốc độ & giọng đọc */}
              <Card className="sm:col-span-2 bg-slate-800/50 border-slate-700/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      3. Tốc Độ Phát Âm &amp; Giọng Đọc
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Tốc độ: <span className="text-rose-400 font-bold">{playbackSpeed}x</span> &bull; Giọng:{" "}
                      <span className="text-rose-400 font-semibold truncate inline-block max-w-[180px] align-bottom">
                        {FIXED_VOICE_NAME} ⭐
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700/60 text-xs">
                    {[0.85, 0.95, 1.05].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          saveSystemAudioSettings({ playbackSpeed: speed });
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          playbackSpeed === speed
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {speed === 0.85 ? "0.85x Chậm" : speed === 0.95 ? "0.95x Chuẩn" : "1.05x Nhanh"}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAudioModal(true)}
                    className="border-slate-700 hover:bg-slate-700 text-slate-300 text-xs h-8 px-2.5 rounded-xl shrink-0"
                  >
                    <span>Chi Tiết</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Friendly Exam Rules */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                Lưu Ý Quan Trọng Khi Làm Bài Thi HSKK:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-200/90 leading-relaxed">
                <li>
                  Chỉ bắt đầu nói <strong>sau khi nghe thấy tiếng bíp &lsquo;嘀&rsquo;</strong> vang lên.
                </li>
                <li>
                  Nếu bạn trả lời xong trước khi hết giờ, hãy bấm <strong>&ldquo;Tôi đã nói xong &bull; Nộp câu này&rdquo;</strong> để sang câu tiếp theo ngay.
                </li>
                <li>
                  Thí sinh: <strong className="text-white">{session.userName}</strong> &bull; Bài thi:{" "}
                  <strong className="text-white">{template.title}</strong> ({template.totalQuestions} câu hỏi, ~{template.totalDurationMinutes} phút).
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/dashboard/hskk" className="w-full sm:w-1/3">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 h-12 rounded-2xl text-xs font-semibold"
                >
                  Quay Về Trang Trước
                </Button>
              </Link>
              <Button
                onClick={handleStartExam}
                className="w-full sm:flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold h-12 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 cursor-pointer"
              >
                <span>Tôi Đã Sẵn Sàng &bull; Bắt Đầu Làm Bài</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: OPENING ANNOUNCEMENT
  // =========================================================================
  if (phase === "OPENING_ANNOUNCEMENT") {
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6 select-none">
        <div className="w-20 h-20 rounded-3xl bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30 animate-pulse shadow-xl shadow-rose-950">
          <Volume2 className="h-10 w-10 text-rose-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <Badge className="bg-rose-900/60 text-rose-300 border-rose-700 text-xs px-3 py-1">
            Băng Ghi Âm Đề Thi Đang Phát
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            欢迎参加汉语水平口语考试
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Kỳ thi Khẩu ngữ Tiếng Trung HSKK chính thức bắt đầu. Toàn bài thi gồm 3 phần. Xin vui lòng lắng nghe kỹ hướng dẫn và chuẩn bị trả lời sau tiếng bíp...
          </p>
        </div>
        <SoundWave isActive={true} size="lg" />
      </div>
    );
  }

  // =========================================================================
  // VIEW 5: SUBMITTING / AI GRADING
  // =========================================================================
  if (phase === "SUBMITTING") {
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-5 select-none">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center mx-auto shadow-xl shadow-rose-900/50 animate-bounce">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2 max-w-md">
          <Badge className="bg-rose-950 text-rose-300 border-rose-800 text-xs px-3 py-0.5">
            Giám Khảo Khảo Thí AI
          </Badge>
          <h2 className="text-2xl font-black text-white">Đang Chấm Điểm Bài Thi HSKK</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Hệ thống đang đối chiếu câu trả lời với barem CTI: Phân tích phổ ngữ âm F0, độ chuẩn thanh điệu, cấu trúc ngữ pháp và tính mạch lạc...
          </p>
        </div>
        <div className="w-56 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
          <div className="bg-rose-600 h-full w-3/4 animate-pulse" />
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 6: RESULT & CERTIFICATE SCORECARD
  // =========================================================================
  if (phase === "RESULT" && finalResult) {
    const isPass = finalResult.isPassed;
    return (
      <div className="min-h-[100dvh] h-[100dvh] w-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col select-none p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
          {/* Header Card: Result Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border ${
              isPass
                ? "bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-800/80 shadow-emerald-950/30"
                : "bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 border-rose-800/80 shadow-rose-950/30"
            } relative overflow-hidden shadow-2xl space-y-4`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-0.5">
                    Chứng Nhận Khảo Thí HSKK 3.0
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Mã: {finalResult.certificateCode}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Phiếu Điểm Khảo Thí HSKK Điện Tử
                </h1>
                <p className="text-xs text-slate-300">
                  Thí sinh: <span className="font-bold text-white">{session.userName}</span> &bull; Số báo danh:{" "}
                  <span className="font-mono text-rose-400 font-bold">{session.candidateNumber}</span>
                </p>
              </div>

              {/* Total Score & Official Stamp */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                    Tổng Điểm HSKK
                  </span>
                  <div
                    className={`text-4xl sm:text-5xl font-black ${
                      isPass ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {finalResult.overallScore}{" "}
                    <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </div>
                </div>

                {/* Stamp */}
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 flex flex-col items-center justify-center font-black rotate-[-8deg] uppercase tracking-wider text-xs shadow-xl shrink-0 ${
                    isPass
                      ? "border-emerald-500 text-emerald-400 bg-emerald-950/50"
                      : "border-rose-500 text-rose-400 bg-rose-950/50"
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-black">{isPass ? "合格" : "不合格"}</span>
                  <span className="text-[10px] font-bold mt-0.5">{isPass ? "ĐẠT CHUẨN" : "CHƯA ĐẠT"}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">CTI &bull; HSK 3.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Part Scores Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Card className="bg-slate-850/60 border-slate-800 bg-slate-900/80 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md">
              <span className="text-xs text-slate-400 font-bold block">
                Phần 1: {template.parts[0]?.nameZh} ({template.parts[0]?.nameVi})
              </span>
              <div className="text-2xl font-black text-white">
                {finalResult.part1Score}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {finalResult.part1Max}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {template.parts[0]?.description}
              </p>
            </Card>

            <Card className="bg-slate-850/60 border-slate-800 bg-slate-900/80 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md">
              <span className="text-xs text-slate-400 font-bold block">
                Phần 2: {template.parts[1]?.nameZh} ({template.parts[1]?.nameVi})
              </span>
              <div className="text-2xl font-black text-white">
                {finalResult.part2Score}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {finalResult.part2Max}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {template.parts[1]?.description}
              </p>
            </Card>

            <Card className="bg-slate-850/60 border-slate-800 bg-slate-900/80 p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md">
              <span className="text-xs text-slate-400 font-bold block">
                Phần 3: {template.parts[2]?.nameZh} ({template.parts[2]?.nameVi})
              </span>
              <div className="text-2xl font-black text-white">
                {finalResult.part3Score}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {finalResult.part3Max}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {template.parts[2]?.description}
              </p>
            </Card>
          </div>

          {/* 4 Language Skill Dimensions */}
          <Card className="bg-slate-900/80 border-slate-800 p-5 rounded-2xl space-y-3 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              <span>Chẩn Đoán Năng Lực Khẩu Ngữ 4 Chiều (Khung HSKK)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Độ Trôi Chảy (流利度)</span>
                <span className="text-lg font-black text-white">{finalResult.fluencyScore}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${finalResult.fluencyScore}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Phát Âm &amp; Thanh Điệu (语音)</span>
                <span className="text-lg font-black text-white">{finalResult.pronunciationScore}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${finalResult.pronunciationScore}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Độ Chuẩn Ngữ Pháp (语法)</span>
                <span className="text-lg font-black text-white">{finalResult.grammarScore}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full" style={{ width: `${finalResult.grammarScore}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Vốn Từ Khẩu Ngữ (词汇)</span>
                <span className="text-lg font-black text-white">{finalResult.vocabularyScore}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${finalResult.vocabularyScore}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Examiner Comments */}
          <Card className="bg-slate-900/80 border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4 shadow-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-rose-500" />
              <span>Nhận Xét Chuyên Môn Của Giám Khảo Khảo Thí CTI</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {finalResult.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Điểm Sáng Khẩu Ngữ:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {finalResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Flame className="h-4 w-4" />
                  Trọng Tâm Cần Cải Thiện:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {finalResult.improvements.map((im, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">&bull;</span>
                      <span>{im}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Detailed Question Review */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-500" />
              <span>Chi Tiết Đánh Giá Từng Câu ({finalResult.detailedQuestions.length})</span>
            </h3>

            <div className="space-y-3">
              {finalResult.detailedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                          Phần {q.partNumber} &bull; #{q.questionIndex}
                        </Badge>
                        <span className="text-xs font-bold text-white">{q.title}</span>
                      </div>
                      <p className="text-xs font-medium text-rose-300 mt-1">
                        Đề bài: &ldquo;{q.prompt}&rdquo;
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white">
                        {q.score}/{q.maxScore}
                      </span>
                      <span className="text-[10px] block text-slate-400 font-semibold">
                        {q.pronunciationQuality}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      Thí sinh đã trả lời:
                    </span>
                    <p className="italic font-sans">&ldquo;{q.candidateSpoken || "(Không phát âm)"}&rdquo;</p>
                  </div>

                  {q.feedback && (
                    <p className="text-xs text-slate-400">
                      <strong>Nhận xét:</strong> {q.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Link href="/dashboard/reports" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-11 rounded-xl text-xs font-bold"
              >
                <FileText className="h-4 w-4 mr-2" />
                Xem Trong Danh Sách Báo Cáo
              </Button>
            </Link>

            <Link href="/dashboard/hskk" className="w-full sm:w-auto">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl text-xs flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>Thi Lại Hoặc Chọn Cấp Độ Khác</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 7: ACTIVE QUESTION IN EXAMINATION (Thân thiện, Không bị đè, Cực nhạy)
  // =========================================================================
  if (!currentQuestion) return null;

  const currentPart = template.parts.find((p) => p.partNumber === currentQuestion.partNumber);
  const totalQuestions = template.questions.length;
  const progressPercent = Math.round(((currentQIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between select-none overflow-hidden relative">
      {/* 1. Top Exam Header Bar (Responsive, Never Collides) */}
      <header className="h-14 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 bg-slate-900/95 backdrop-blur-md z-20">
        {/* Left: Exit button + Level + Question Counter */}
        <div className="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowExitModal(true)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2 -ml-1 rounded-lg text-xs shrink-0"
            title="Thoát phòng thi"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Thoát</span>
          </Button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          <Badge className="bg-rose-600 text-white font-black text-[10px] sm:text-xs px-2 py-0.5 shrink-0">
            HSKK {template.level === "HSKK_PRIMARY" ? "Sơ Cấp" : template.level === "HSKK_INTERMEDIATE" ? "Trung Cấp" : "Cao Cấp"}
          </Badge>

          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {currentPart?.nameVi || currentPart?.nameZh}
            </span>
            <span className="text-[11px] text-slate-400 shrink-0 font-medium">
              &bull; Câu {currentQIndex + 1}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Right: Progress bar + Audio Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Progress bar */}
          <div className="w-16 sm:w-28 bg-slate-800 h-2 rounded-full overflow-hidden shrink-0 border border-slate-700/60 hidden xs:block">
            <div
              className="bg-rose-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Speed Switcher */}
          <button
            type="button"
            onClick={() => {
              const nextSpeed = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.05 : 0.95;
              setPlaybackSpeed(nextSpeed);
              saveSystemAudioSettings({ playbackSpeed: nextSpeed });
            }}
            className="h-8 px-2 text-[11px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Tốc độ phát âm câu hỏi"
          >
            {playbackSpeed}x
          </button>

          {/* Settings Modal Toggle */}
          <button
            type="button"
            onClick={() => setShowAudioModal(true)}
            className="h-8 w-8 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center transition-colors"
            title="Cài đặt âm thanh hệ thống"
          >
            <Settings className="h-4 w-4 text-rose-400" />
          </button>
        </div>
      </header>

      {/* 2. Main Question Examination Center (Flex-1, Scrollable, Safe on Mobile) */}
      <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 my-auto">
          {/* Dynamic Phase Status Indicator */}
          <div className="flex items-center justify-center">
            {phase === "PLAYING_PROMPT" && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold animate-pulse shadow-sm">
                <Volume2 className="h-4 w-4 text-blue-400 animate-spin" />
                <span>Đang phát ghi âm đề thi... Hãy lắng nghe kỹ</span>
              </div>
            )}

            {phase === "PREPARING" && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-sm animate-pulse">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Thời gian chuẩn bị suy nghĩ: {prepSecondsLeft}s</span>
              </div>
            )}

            {phase === "RECORDING" && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold shadow-sm animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span>Đang ghi âm câu trả lời: còn {speakingSecondsLeft}s</span>
              </div>
            )}
          </div>

          {/* Question Card Box */}
          <Card className="bg-slate-800/60 backdrop-blur-md border-slate-700/60 p-4 sm:p-7 rounded-3xl w-full text-center space-y-4 shadow-xl">
            {/* Part 2 Intermediate: PICTURE_DESCRIPTION */}
            {currentQuestion.type === "PICTURE_DESCRIPTION" && currentQuestion.imageUrl && (
              <div className="space-y-2">
                <div
                  onClick={() => setShowImageZoom(true)}
                  className="w-full max-w-sm mx-auto max-h-[30vh] sm:max-h-[35vh] aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2 relative cursor-zoom-in group shadow-inner"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentQuestion.imageUrl}
                    alt={currentQuestion.imageAlt || "Đề thi nhìn tranh nói"}
                    className="w-full h-full object-contain rounded-xl group-hover:scale-102 transition-transform"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-[10px] text-white flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <ZoomIn className="h-3 w-3" />
                    <span>Phóng to</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  请看图说话 (Hãy quan sát bức tranh và miêu tả nội dung)
                </p>
              </div>
            )}

            {/* Part 2 Advanced: READ_PASSAGE */}
            {currentQuestion.type === "READ_PASSAGE" && currentQuestion.readingText && (
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-left space-y-2 max-h-[38vh] overflow-y-auto">
                <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">
                  请朗读短文 / Hãy đọc to đoạn văn sau:
                </span>
                <p className="text-base sm:text-lg leading-relaxed text-slate-100 font-sans tracking-wide select-text">
                  {currentQuestion.readingText}
                </p>
              </div>
            )}

            {/* Standard Audio Prompt */}
            {currentQuestion.type !== "READ_PASSAGE" && (
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-white leading-relaxed tracking-wide">
                  {currentQuestion.audioPrompt}
                </h2>

                {currentQuestion.pinyinPrompt && showPinyin && (
                  <p className="text-xs sm:text-sm font-mono text-rose-300/90 tracking-wide">
                    {currentQuestion.pinyinPrompt}
                  </p>
                )}

                {currentQuestion.vietnamesePrompt && (
                  <p className="text-xs text-slate-400 italic">
                    Gợi ý: {currentQuestion.vietnamesePrompt}
                  </p>
                )}
              </div>
            )}

            {/* Visualizer & Countdown Zone */}
            {phase === "RECORDING" ? (
              <div className="space-y-3 pt-1">
                {/* Visual Audio Wave & Mic Volume */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <SoundWave isActive={true} color="cinnabar" size="md" />

                  {/* Mic Volume Level Bar */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mic className="h-3.5 w-3.5 text-rose-400" />
                    <span>Mức thu âm:</span>
                    <div className="w-24 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-75"
                        style={{ width: `${Math.max(recordingVolume, 8)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Countdown Time */}
                <div className="text-4xl sm:text-5xl font-black text-rose-400 font-mono tracking-tight">
                  00:{String(speakingSecondsLeft).padStart(2, "0")}
                </div>

                {/* Live Speech Preview Bubble */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-xs text-slate-300 min-h-[48px] flex items-center justify-center">
                  {learnerTranscript ? (
                    <p className="text-emerald-300 font-sans italic text-sm">
                      &ldquo;{learnerTranscript}&rdquo;
                    </p>
                  ) : (
                    <span className="text-slate-500">
                      Đang lắng nghe giọng nói của bạn... Hãy phát biểu to, rõ ràng nhé!
                    </span>
                  )}
                </div>
              </div>
            ) : phase === "PREPARING" ? (
              <div className="space-y-2 py-4">
                <span className="text-xs text-amber-300 uppercase tracking-widest block font-bold">
                  Thời Gian Chuẩn Bị Còn Lại
                </span>
                <div className="text-5xl sm:text-6xl font-black text-amber-400 font-mono">
                  {prepSecondsLeft}s
                </div>
                <p className="text-xs text-slate-400">
                  Hãy suy nghĩ ý câu trả lời. Chuẩn bị nói khi nghe tiếng bíp &lsquo;嘀&rsquo;.
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-2">
                <Volume2 className="h-8 w-8 text-blue-400 mx-auto animate-pulse" />
                <span className="text-xs text-slate-400 block">
                  Đang nghe đề bài qua tai nghe...
                </span>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* 3. Bottom Exam Controls Bar (Touch-Friendly, Always Visible) */}
      <footer className="h-16 border-t border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 bg-slate-900/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          {/* Pinyin Toggle */}
          {currentQuestion.pinyinPrompt && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const next = !showPinyin;
                setShowPinyin(next);
                saveSystemAudioSettings({ showPinyin: next });
              }}
              className="text-xs border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white h-9 px-3 rounded-xl flex items-center gap-1.5"
            >
              {showPinyin ? <EyeOff className="h-3.5 w-3.5 text-rose-400" /> : <Eye className="h-3.5 w-3.5 text-rose-400" />}
              <span>{showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}</span>
            </Button>
          )}

          {/* Replay Prompt Button in Practice Mode */}
          {session.mode === "PRACTICE" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReplayPrompt}
              className="text-xs border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white h-9 px-3 rounded-xl flex items-center gap-1.5"
              title="Nghe lại câu hỏi (Dành cho chế độ luyện tập)"
            >
              <Volume2 className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">Nghe Lại Đề</span>
            </Button>
          )}
        </div>

        {/* Primary Action Button: Finish Early */}
        <div className="flex items-center gap-2">
          {phase === "RECORDING" && (
            <Button
              type="button"
              onClick={handleFinishEarly}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm h-11 px-4 sm:px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer animate-in fade-in"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Tôi Đã Nói Xong &bull; Nộp Câu Này</span>
            </Button>
          )}
        </div>
      </footer>

      {/* ===================================================================== */}
      {/* MODAL 1: SYSTEM AUDIO SETTINGS                                        */}
      {/* ===================================================================== */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Settings className="h-5 w-5 text-rose-500" />
                <h3 className="text-base font-bold">Cài Đặt Âm Thanh &amp; Giọng Đọc</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Giọng đọc Giám khảo HSK (TTS):
                </label>
                <select
                  value={FIXED_VOICE_NAME}
                  onChange={() => {
                    setSelectedVoiceName(FIXED_VOICE_NAME);
                    saveSystemAudioSettings({ voiceName: FIXED_VOICE_NAME });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                >
                  <option value={FIXED_VOICE_NAME}>
                    {FIXED_VOICE_LABEL}
                  </option>
                </select>
                <p className="text-[11px] text-emerald-400 mt-1 font-medium">
                  ✓ Cố định giọng chuẩn khảo thí HSK / HSKK
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Ngôn ngữ nhận diện giọng nói Micro (STT):
                </label>
                <select
                  value={recognitionLang}
                  onChange={(e) => {
                    const lang = e.target.value;
                    setRecognitionLang(lang);
                    saveSystemAudioSettings({ recognitionLang: lang });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="zh-CN">Tiếng Trung Đại Lục (Phổ thông / zh-CN)</option>
                  <option value="zh-TW">Tiếng Trung Chuẩn (Phổ thông / zh-TW)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
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
                      className={`flex-1 py-2 rounded-xl font-bold transition-all text-xs ${
                        playbackSpeed === speed
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {speed === 0.85 ? "0.85x Chậm" : speed === 0.95 ? "0.95x Chuẩn" : "1.05x Nhanh"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    hskkAudio.speakChinese("欢迎参加汉语水平口语考试。发音与语速测试正常。", {
                      rate: playbackSpeed,
                      voiceName: selectedVoiceName,
                    });
                  }}
                  className="border-slate-700 text-slate-300 hover:text-white text-xs h-9 rounded-xl"
                >
                  <Volume2 className="h-3.5 w-3.5 mr-1.5 text-rose-400" />
                  <span>Thử nghe giọng đọc</span>
                </Button>

                <Button
                  onClick={() => setShowAudioModal(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 px-5 rounded-xl"
                >
                  Lưu &amp; Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EXIT CONFIRMATION MODAL                                      */}
      {/* ===================================================================== */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Bạn muốn tạm dừng bài thi?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Các câu trả lời bạn đã nói trước đó đã được lưu an toàn trên hệ thống. Bạn có chắc chắn muốn quay về trang chính?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowExitModal(false)}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 h-10 rounded-xl text-xs font-semibold"
              >
                Tiếp Tục Thi
              </Button>
              <Button
                onClick={() => {
                  stopMicListening();
                  router.push("/dashboard/hskk");
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white h-10 rounded-xl text-xs font-bold"
              >
                Thoát Phòng Thi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: IMAGE ZOOM PREVIEW (Part 2 Picture Description)              */}
      {/* ===================================================================== */}
      {showImageZoom && currentQuestion.imageUrl && (
        <div
          onClick={() => setShowImageZoom(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div className="relative max-w-2xl w-full max-h-[85vh] flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentQuestion.imageUrl}
              alt={currentQuestion.imageAlt || "Đề thi nhìn tranh nói"}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setShowImageZoom(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
