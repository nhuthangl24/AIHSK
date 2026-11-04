"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChevronRight,
  Flame,
  HelpCircle,
  Settings,
  X,
  Languages,
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

  const [session, setSession] = useState<HskkSession | null>(null);
  const [template, setTemplate] = useState<HskkExamTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Exam flow states
  const [phase, setPhase] = useState<ExamPhase>("INITIAL_CHECK");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(0);
  const [speakingSecondsLeft, setSpeakingSecondsLeft] = useState(0);
  const [showPinyin, setShowPinyin] = useState(true);

  // System Audio Settings (Synchronized globally with localStorage & events)
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [playbackSpeed, setPlaybackSpeed] = useState(0.95);
  const [recognitionLang, setRecognitionLang] = useState("zh-CN");

  // Audio & Mic Testing states
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);

  // Speech Recognition & Recording
  const [learnerTranscript, setLearnerTranscript] = useState("");
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [finalResult, setFinalResult] = useState<HskkResult | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);

  // 1. Fetch Session & Template Data on Mount + Init System Audio Settings
  useEffect(() => {
    // A. Sync with System Audio Settings
    const sys = getSystemAudioSettings();
    setSelectedVoiceName(sys.voiceName || "");
    setPlaybackSpeed(sys.playbackSpeed || 0.95);
    setRecognitionLang(sys.recognitionLang || "zh-CN");
    setShowPinyin(typeof sys.showPinyin === "boolean" ? sys.showPinyin : true);

    const loadVoices = () => {
      const vList = getAvailableChineseVoices();
      setAvailableVoices(vList);
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
      if (typeof updated.showPinyin === "boolean") setShowPinyin(updated.showPinyin);
    };
    window.addEventListener("aihsk_audio_settings_changed", onSettingsChanged);

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/hskk/sessions/${sessionId}`);
        const data = await res.json();
        if (!data.success || !data.session) {
          setErrorMsg(data.error || "Không tìm thấy phòng thi HSKK");
          return;
        }
        setSession(data.session);
        setTemplate(data.template);

        if (data.session.status === "COMPLETED" && data.session.result) {
          setFinalResult(data.session.result);
          setPhase("RESULT");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Lỗi tải thông tin phòng thi");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      hskkAudio.stopSpeaking();
      stopMicListening();
      window.removeEventListener("aihsk_audio_settings_changed", onSettingsChanged);
    };
  }, [sessionId]);

  // Clean up mic test on unmount
  const stopMicListening = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  // 2. Hardware Checks
  const handleTestAudio = async () => {
    setIsTestingAudio(true);
    await hskkAudio.playPromptBeep(1000, 350);
    hskkAudio.speakChinese("欢迎参加汉语水平口语考试。耳机测试正常。", {
      onEnd: () => setIsTestingAudio(false),
      onError: () => setIsTestingAudio(false),
    });
  };

  const handleTestMic = async () => {
    try {
      if (isTestingMic) {
        stopMicListening();
        setIsTestingMic(false);
        setMicVolumeLevel(0);
        return;
      }

      setIsTestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!micAnalyserRef.current) return;
        micAnalyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        if (micStreamRef.current) {
          requestAnimationFrame(checkVolume);
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
      // Completed all questions -> Submit
      handleSubmitAllAnswers();
      return;
    }

    setCurrentQIndex(qIndex);
    const q = template.questions[qIndex];
    setLearnerTranscript("");

    // Step A: Play Prompt or Question Audio
    setPhase("PLAYING_PROMPT");
    hskkAudio.stopSpeaking();

    // Section transition announcement check
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
        // Step B: Preparation Time if applicable
        if (q.prepTimeSeconds > 0) {
          runPreparationPhase(q);
        } else {
          runRecordingPhase(q);
        }
      },
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

    // Play official HSKK prompt "嘀" (1000Hz beep)
    await hskkAudio.playPromptBeep(1000, 450);

    setPhase("RECORDING");
    setSpeakingSecondsLeft(q.speakingTimeSeconds);
    setIsRecordingActive(true);

    // Start Web Speech Recognition
    startSpeechRecognition();

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

    // Play ending beep
    await hskkAudio.playEndingBeep();

    const spokenText = learnerTranscript.trim();

    // Save answer to server
    fetch(`/api/hskk/sessions/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: q.id,
        answer: {
          questionId: q.id,
          partNumber: q.partNumber,
          questionIndex: q.questionIndex,
          transcript: spokenText,
          durationSeconds: q.speakingTimeSeconds - speakingSecondsLeft,
        },
      }),
    }).catch(() => null);

    // Advance to next question
    setTimeout(() => {
      startQuestion(currentQIndex + 1);
    }, 1000);
  };

  const handleFinishEarly = () => {
    if (currentQuestion && phase === "RECORDING") {
      finishCurrentQuestion(currentQuestion);
    }
  };

  // 5. Submit All & Run AI Examiner Scoring
  const handleSubmitAllAnswers = async () => {
    setPhase("SUBMITTING");
    hskkAudio.stopSpeaking();
    stopSpeechRecognition();

    try {
      const res = await fetch(`/api/hskk/sessions/${sessionId}/submit`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.result) {
        setFinalResult(data.result);
        setPhase("RESULT");
        hskkAudio.playSectionChime();
      } else {
        setErrorMsg(data.error || "Chấm thi thất bại");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi nộp bài thi");
    }
  };

  // =========================================================================
  // RENDER VIEWS
  // =========================================================================

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
        <h2 className="text-lg font-bold">Đang kết nối phòng thi ảo HSKK...</h2>
        <p className="text-xs text-slate-400">Kiểm tra kết nối và cấu hình đề thi chuẩn CTI</p>
      </div>
    );
  }

  if (errorMsg || !session || !template) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center space-y-4">
        <AlertCircle className="h-14 w-14 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Không thể vào phòng thi</h2>
        <p className="text-sm text-slate-400 max-w-md">{errorMsg || "Dữ liệu kỳ thi không hợp lệ"}</p>
        <Link href="/dashboard/hskk">
          <Button className="bg-rose-600 hover:bg-rose-700 font-bold px-6 py-2.5 rounded-xl">
            Quay Về Trang HSKK
          </Button>
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW 1: INITIAL CHECK (Kiểm tra thiết bị & Quy chế)
  // -------------------------------------------------------------------------
  if (phase === "INITIAL_CHECK") {
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-black text-white text-lg">
              HSKK
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                {template.titleZh}
              </h1>
              <p className="text-xs text-slate-400">{template.title}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              Số Báo Danh (准考证号)
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-rose-400">
              {session.candidateNumber}
            </span>
          </div>
        </div>

        {/* Center Card: Hardware Checks & Rules */}
        <div className="max-w-2xl mx-auto w-full my-auto py-6 space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-rose-950 text-rose-300 border-rose-800 py-1 px-3 text-xs">
              Mô Phỏng Phòng Thi Máy Tính Quốc Tế (机考)
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Kiểm Tra Thiết Bị &amp; Quy Chế Phòng Thi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Đảm bảo tai nghe và microphone hoạt động rõ ràng trước khi phát lệnh bắt đầu làm bài thi chính thức.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Audio Check */}
            <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <Headphones className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-bold text-white">1. Kiểm tra Tai Nghe</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bấm nút bên dưới để nghe thử tiếng bíp '嘀' và giọng đọc của Giám khảo CTI.
              </p>
              <Button
                type="button"
                onClick={handleTestAudio}
                disabled={isTestingAudio}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
              >
                <Volume2 className="h-4 w-4 text-rose-400" />
                <span>{isTestingAudio ? "Đang phát âm thanh mẫu..." : "Phát Thử Âm Thanh"}</span>
              </Button>
            </Card>

            {/* Mic Check */}
            <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2.5">
                <Mic className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-bold text-white">2. Kiểm tra Microphone</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nói vào micro để kiểm tra độ nhạy và mức thu âm thanh của trình duyệt.
              </p>
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleTestMic}
                  className={`w-full font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 ${
                    isTestingMic
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  <Mic className="h-4 w-4" />
                  <span>{isTestingMic ? "Đang thu âm... (Bấm để dừng)" : "Thử Micro Của Bạn"}</span>
                </Button>
                {isTestingMic && (
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-100"
                      style={{ width: `${micVolumeLevel}%` }}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Audio Settings Integration Card */}
            <Card className="sm:col-span-2 bg-slate-900 border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    3. Cài Đặt Âm Thanh &amp; Giọng Đọc Hệ Thống
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Giọng đọc: <span className="text-rose-400 font-semibold">{selectedVoiceName || "Google 國語 / Chuẩn HSK"}</span> &bull; Tốc độ: <span className="text-rose-400 font-semibold">{playbackSpeed}x</span> &bull; Micro STT: <span className="text-rose-400 font-semibold">{recognitionLang}</span>
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAudioModal(true)}
                className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs h-9 px-4 rounded-xl shrink-0"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                <span>Tùy Chỉnh Âm Thanh</span>
              </Button>
            </Card>
          </div>

          {/* Exam Rules checklist */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
              Quy Chế Phòng Thi Khẩu Ngữ HSKK:
            </span>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Mỗi câu chỉ được phát thanh 1 lần duy nhất theo đúng băng thi của Hanban/CTI.</li>
              <li>Chỉ bắt đầu nói <strong>sau khi nghe thấy tiếng bíp '嘀'</strong> vang lên.</li>
              <li>Khi hết thời gian ghi âm, hệ thống sẽ tự động ngắt và chuyển sang câu tiếp theo.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link href="/dashboard/hskk" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 h-12 rounded-2xl"
              >
                Hủy Bỏ &amp; Quay Về
              </Button>
            </Link>
            <Button
              onClick={handleStartExam}
              className="w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40"
            >
              <span>Tôi Đã Hiểu &amp; Bắt Đầu Làm Bài Thi</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-900 pt-3">
          Hệ thống khảo thí HSKK Classnia AI &bull; Barem điểm CTI 2024 &bull; Thí sinh: {session.userName}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW 2: OPENING ANNOUNCEMENT (Lời mở đầu kỳ thi)
  // -------------------------------------------------------------------------
  if (phase === "OPENING_ANNOUNCEMENT") {
    return (
      <div className="h-full w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-600/20 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30 animate-pulse">
          <Volume2 className="h-10 w-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <Badge className="bg-rose-900/60 text-rose-300 border-rose-700 text-xs">
            Băng Ghi Âm Đang Phát
          </Badge>
          <h2 className="text-2xl font-black">欢迎参加汉语水平口语考试</h2>
          <p className="text-sm text-slate-400">
            Kỳ thi Khẩu ngữ Tiếng Trung HSKK chính thức bắt đầu. Toàn bài thi gồm 3 phần. Xin vui lòng lắng nghe kỹ hướng dẫn...
          </p>
        </div>
        <SoundWave isActive={true} size="lg" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW 3: SUBMITTING / AI GRADING
  // -------------------------------------------------------------------------
  if (phase === "SUBMITTING") {
    return (
      <div className="h-full w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center mx-auto animate-bounce">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black">Giám Khảo AI Đang Chấm Thi</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Hệ thống đang đối chiếu băng ghi âm với barem CTI: Phân tích phổ ngữ âm F0, độ chuẩn thanh điệu, ngữ pháp câu và tính mạch lạc...
          </p>
        </div>
        <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-rose-600 h-full w-3/4 animate-pulse" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW 4: OFFICIAL RESULT & CERTIFICATE
  // -------------------------------------------------------------------------
  if (phase === "RESULT" && finalResult) {
    const isPass = finalResult.isPassed;
    return (
      <div className="h-full w-full overflow-y-auto bg-slate-950 text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card: Result Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border ${
              isPass
                ? "bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-800/80"
                : "bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-800/80"
            } relative overflow-hidden shadow-2xl`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-800 text-slate-300 text-xs">
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

              {/* Total Score Circle & Official Stamp */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                    Tổng Điểm HSKK
                  </span>
                  <div
                    className={`text-4xl font-black ${
                      isPass ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {finalResult.overallScore}{" "}
                    <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </div>
                </div>

                {/* Stamp */}
                <div
                  className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-black rotate-[-8deg] uppercase tracking-wider text-xs shadow-lg ${
                    isPass
                      ? "border-emerald-500 text-emerald-400 bg-emerald-950/40"
                      : "border-rose-500 text-rose-400 bg-rose-950/40"
                  }`}
                >
                  <span className="text-lg">{isPass ? "合格" : "不合格"}</span>
                  <span className="text-[10px]">{isPass ? "ĐẠT CHUẨN" : "CHƯA ĐẠT"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Part Scores Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-bold block">
                Phần 1: {template.parts[0]?.nameZh} ({template.parts[0]?.nameVi})
              </span>
              <div className="text-2xl font-black text-white">
                {finalResult.part1Score}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {finalResult.part1Max}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {template.parts[0]?.description}
              </p>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-bold block">
                Phần 2: {template.parts[1]?.nameZh} ({template.parts[1]?.nameVi})
              </span>
              <div className="text-2xl font-black text-white">
                {finalResult.part2Score}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {finalResult.part2Max}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {template.parts[1]?.description}
              </p>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-bold block">
                Phần 3: {template.parts[2]?.nameZh} ({template.parts[2]?.nameVi})
              </span>
              <div className="text-2xl font-black text-white">
                {finalResult.part3Score}{" "}
                <span className="text-xs text-slate-500 font-normal">/ {finalResult.part3Max}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {template.parts[2]?.description}
              </p>
            </Card>
          </div>

          {/* Examiner Comments */}
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-3xl space-y-4">
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
              <span>Chi Tiết Băng Thu Âm &amp; Đánh Giá Từng Câu ({finalResult.detailedQuestions.length})</span>
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

                  {/* Candidate spoken */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      Thí sinh đã trả lời:
                    </span>
                    <p className="italic font-sans">&ldquo;{q.candidateSpoken}&rdquo;</p>
                  </div>

                  {/* Feedback */}
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
                className="w-full border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 h-11 rounded-xl text-xs font-bold"
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

  // -------------------------------------------------------------------------
  // VIEW 5: ACTIVE EXAM (Phần thi từng câu trong phòng thi)
  // -------------------------------------------------------------------------
  if (!currentQuestion) return null;

  const currentPart = template.parts.find((p) => p.partNumber === currentQuestion.partNumber);
  const totalQuestions = template.questions.length;
  const progressPercent = Math.round(((currentQIndex + 1) / totalQuestions) * 100);

  return (
    <div className="h-full w-full bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Top Exam Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-rose-600 text-white font-black text-xs px-2.5 py-0.5">
            HSKK
          </Badge>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{template.titleZh}</span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                &bull; {currentPart?.nameZh} ({currentPart?.nameVi})
              </span>
            </h1>
            <span className="text-[11px] text-slate-400">
              Câu {currentQIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Progress & Candidate Info */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
              Số Báo Danh
            </span>
            <span className="font-mono text-xs font-bold text-rose-400">
              {session.candidateNumber}
            </span>
          </div>

          <div className="w-24 sm:w-36 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Audio Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const nextSpeed = playbackSpeed === 0.95 ? 0.85 : playbackSpeed === 0.85 ? 1.05 : 0.95;
                setPlaybackSpeed(nextSpeed);
                saveSystemAudioSettings({ playbackSpeed: nextSpeed });
              }}
              className="h-7 px-2 text-[11px] font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
              title="Tốc độ phát âm câu hỏi"
            >
              {playbackSpeed}x
            </button>

            <button
              type="button"
              onClick={() => setShowAudioModal(true)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
              title="Cài đặt âm thanh hệ thống"
            >
              <Settings className="h-4 w-4 text-rose-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Examination Center Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full py-4 overflow-y-auto">
        {/* Phase-specific Header Indicator */}
        <div className="mb-4">
          {phase === "PLAYING_PROMPT" && (
            <Badge className="bg-blue-950 text-blue-300 border-blue-800 px-3 py-1 text-xs animate-pulse flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5" />
              <span>正在播放录音... / Đang phát băng ghi âm đề thi</span>
            </Badge>
          )}

          {phase === "PREPARING" && (
            <Badge className="bg-amber-950 text-amber-300 border-amber-800 px-3 py-1 text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>准备时间 / Thời gian chuẩn bị suy nghĩ: {prepSecondsLeft}s</span>
            </Badge>
          )}

          {phase === "RECORDING" && (
            <Badge className="bg-rose-950 text-rose-300 border-rose-800 px-3 py-1 text-xs flex items-center gap-1.5 animate-pulse">
              <Mic className="h-3.5 w-3.5 text-rose-500" />
              <span>正在录音 / Đang ghi âm câu trả lời: {speakingSecondsLeft}s còn lại</span>
            </Badge>
          )}
        </div>

        {/* Question Content Display */}
        <Card className="bg-slate-900 border-slate-800 p-6 sm:p-8 rounded-3xl w-full text-center space-y-5 shadow-2xl">
          {/* Part 2: Intermediate Picture Description */}
          {currentQuestion.type === "PICTURE_DESCRIPTION" && currentQuestion.imageUrl && (
            <div className="w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentQuestion.imageUrl}
                alt={currentQuestion.imageAlt || "Đề thi nhìn tranh nói"}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          )}

          {/* Part 2: Advanced Reading Passage */}
          {currentQuestion.type === "READ_PASSAGE" && currentQuestion.readingText && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
              <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">
                请朗读短文 / Hãy đọc to đoạn văn sau:
              </span>
              <p className="text-base sm:text-lg leading-relaxed text-slate-100 font-sans tracking-wide">
                {currentQuestion.readingText}
              </p>
            </div>
          )}

          {/* Prompt Text (for Repeat & Question Answer) */}
          {currentQuestion.type !== "READ_PASSAGE" && (
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {currentQuestion.audioPrompt}
              </h2>

              {/* Optional Pinyin Toggle */}
              {currentQuestion.pinyinPrompt && showPinyin && (
                <p className="text-xs sm:text-sm font-mono text-slate-400">
                  {currentQuestion.pinyinPrompt}
                </p>
              )}

              {currentQuestion.vietnamesePrompt && (
                <p className="text-xs text-slate-500 italic">
                  Gợi ý: {currentQuestion.vietnamesePrompt}
                </p>
              )}
            </div>
          )}

          {/* Visual Waveform & Timers */}
          {phase === "RECORDING" ? (
            <div className="space-y-3 pt-2">
              <SoundWave isActive={true} size="lg" />
              <div className="text-4xl sm:text-5xl font-black text-rose-500 font-mono">
                00:{String(speakingSecondsLeft).padStart(2, "0")}
              </div>

              {/* Real-time Learner Transcript Preview */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 min-h-[50px] flex items-center justify-center">
                {learnerTranscript ? (
                  <p className="italic text-emerald-300 font-sans">&ldquo;{learnerTranscript}&rdquo;</p>
                ) : (
                  <span className="text-slate-600">
                    Đang lắng nghe giọng nói của bạn... Hãy phát biểu to, rõ ràng
                  </span>
                )}
              </div>
            </div>
          ) : phase === "PREPARING" ? (
            <div className="space-y-2 py-4">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold">
                Thời Gian Chuẩn Bị Còn Lại
              </span>
              <div className="text-5xl font-black text-amber-400 font-mono">
                {prepSecondsLeft}s
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-3">
              <Volume2 className="h-10 w-10 text-rose-500 mx-auto animate-pulse" />
              <span className="text-xs text-slate-400 block">
                Lắng nghe đề thi qua tai nghe...
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Exam Controls Bar */}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {currentQuestion.pinyinPrompt && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const next = !showPinyin;
                setShowPinyin(next);
                saveSystemAudioSettings({ showPinyin: next });
              }}
              className="text-xs text-slate-400 hover:text-white h-9 px-3 rounded-xl"
            >
              {showPinyin ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
              <span>{showPinyin ? "Ẩn Pinyin" : "Hiện Pinyin"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAudioModal(true)}
            className="text-xs text-slate-400 hover:text-white h-9 px-3 rounded-xl flex items-center gap-1.5"
          >
            <Settings className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">Cài đặt âm thanh</span>
          </Button>
        </div>

        {/* Action Button: Finish question early if candidate spoke already */}
        {phase === "RECORDING" && (
          <Button
            type="button"
            onClick={handleFinishEarly}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5"
          >
            <Square className="h-3.5 w-3.5 text-rose-400" />
            <span>Nói Xong &bull; Nộp Câu Này</span>
          </Button>
        )}
      </div>

      {/* System Audio Settings Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Settings className="h-5 w-5 text-rose-500" />
                <h3 className="text-base font-bold">Cài Đặt Âm Thanh &amp; Giọng Đọc</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                  value={selectedVoiceName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedVoiceName(name);
                    saveSystemAudioSettings({ voiceName: name });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-rose-500"
                >
                  {availableVoices.length === 0 ? (
                    <option value="">Giọng đọc mặc định của trình duyệt</option>
                  ) : (
                    availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  )}
                </select>
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
                      className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                        playbackSpeed === speed
                          ? "bg-rose-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {speed === 0.85 ? "0.85x (Chậm)" : speed === 0.95 ? "0.95x (Chuẩn)" : "1.05x (Nhanh)"}
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
                  Hoàn tất &amp; Lưu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
