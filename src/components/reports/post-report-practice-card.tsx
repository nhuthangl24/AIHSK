"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  GraduationCap,
  Settings,
  X,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PracticeQuestion } from "@/lib/practice/practice-bank-generator";
import {
  getSystemAudioSettings,
  saveSystemAudioSettings,
  speakWithSystemSettings,
  stopSystemSpeech,
  getAvailableChineseVoices,
  SystemAudioSettings,
  FIXED_VOICE_NAME,
  FIXED_VOICE_LABEL,
} from "@/lib/audio/system-audio-settings";

interface PostReportPracticeProps {
  questions: PracticeQuestion[];
  topicTitle: string;
  targetLevel?: string;
}

export function PostReportPracticeCard({
  questions,
  topicTitle,
  targetLevel = "HSK 3",
}: PostReportPracticeProps) {
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id || null);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  // System Audio Settings integration
  const [audioSettings, setAudioSettings] = useState<SystemAudioSettings>(getSystemAudioSettings());
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);

  // Sync available voices and system settings
  useEffect(() => {
    if (typeof window === "undefined") return;

    setAudioSettings(getSystemAudioSettings());
    setShowPinyin(getSystemAudioSettings().showPinyin);

    const loadVoices = () => {
      const v = getAvailableChineseVoices();
      setAvailableVoices(v);
    };

    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const handleSettingsChange = (e: any) => {
      if (e.detail) {
        setAudioSettings(e.detail);
        setShowPinyin(e.detail.showPinyin);
      }
    };

    window.addEventListener("aihsk_audio_settings_changed", handleSettingsChange);
    return () => {
      window.removeEventListener("aihsk_audio_settings_changed", handleSettingsChange);
      stopSystemSpeech();
    };
  }, []);

  const handleSpeak = (text: string, id: string, speedOverride?: number) => {
    if (activeSpeechId === id) {
      stopSystemSpeech();
      setActiveSpeechId(null);
      return;
    }

    speakWithSystemSettings(text, {
      speedOverride: speedOverride || audioSettings.playbackSpeed,
      voiceNameOverride: audioSettings.voiceName,
      onStart: () => setActiveSpeechId(id),
      onEnd: () => setActiveSpeechId(null),
      onError: () => setActiveSpeechId(null),
    });
  };

  const handleCycleSpeed = () => {
    const speeds = [0.85, 0.95, 1.05];
    const currentIdx = speeds.indexOf(audioSettings.playbackSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    const updated = saveSystemAudioSettings({ playbackSpeed: nextSpeed });
    setAudioSettings(updated);
  };

  const handleTogglePinyin = () => {
    const next = !showPinyin;
    setShowPinyin(next);
    saveSystemAudioSettings({ showPinyin: next });
  };

  if (!questions || questions.length === 0) return null;

  return (
    <>
      <Card className="rounded-3xl border-rose-200/90 dark:border-rose-900/50 shadow-md bg-gradient-to-b from-white via-rose-50/15 to-white dark:from-slate-900 dark:via-rose-950/10 dark:to-slate-900 overflow-hidden">
        <CardHeader className="p-5 sm:p-7 pb-4 border-b border-rose-100/80 dark:border-rose-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  Đặc quyền ôn tập
                </Badge>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  Chuẩn hóa khẩu ngữ {targetLevel}
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Bộ Câu Hỏi Luyện Tập Chuyên Sâu Sau Báo Cáo</span>
              </CardTitle>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Dựa trên kết quả bài thi chủ đề <strong className="text-slate-800 dark:text-slate-200">&quot;{topicTitle}&quot;</strong>, AI đã tổng hợp 5 câu hỏi nâng cao giúp bạn khắc phục lỗi ngữ âm, mở rộng vốn từ vựng và tự tin phản biện.
              </p>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Audio Settings Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAudioSettingsModal(true)}
                className="h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                title="Cài đặt âm thanh & giọng đọc hệ thống"
              >
                <Settings className="h-3.5 w-3.5 text-rose-600" />
                <span className="hidden md:inline">Giọng đọc ({audioSettings.playbackSpeed}x)</span>
              </Button>

              <Link href={`/dashboard/free-talk?initialTopic=${encodeURIComponent(topicTitle)}`}>
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm shrink-0 h-8 px-3"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Luyện nói Free-Talk</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-7 space-y-4">
          {questions.map((q, idx) => {
            const isExpanded = expandedId === q.id;
            const isSpeaking = activeSpeechId === q.id;

            return (
              <div
                key={q.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? "border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-850 shadow-sm ring-2 ring-rose-500/10"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-850"
                } p-4 sm:p-5 space-y-3`}
              >
                {/* Question Header & System-Configured Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                      {q.categoryLabel}
                    </span>
                  </div>

                  {/* Standardized Audio & Display Toolbar (Inherits System Settings) */}
                  <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    {/* Speed Toggle (0.85x / 0.95x / 1.05x) */}
                    <button
                      type="button"
                      onClick={handleCycleSpeed}
                      className="h-6 px-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-md transition-colors"
                      title="Tốc độ phát âm hệ thống"
                    >
                      {audioSettings.playbackSpeed}x
                    </button>

                    {/* Pinyin Visibility Toggle */}
                    <button
                      type="button"
                      onClick={handleTogglePinyin}
                      className={`h-6 px-1.5 text-[10px] sm:text-[11px] font-semibold rounded-md border transition-colors ${
                        showPinyin
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60"
                          : "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title="Bật/Tắt Pinyin"
                    >
                      {showPinyin ? "文 Pinyin" : "文 Ẩn"}
                    </button>

                    {/* Speak Button (Uses System Voice & Rate) */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(q.questionZh, q.id)}
                      className={`h-6 px-2 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all flex items-center gap-1 ${
                        isSpeaking
                          ? "bg-rose-600 text-white animate-pulse shadow-2xs"
                          : "text-rose-600 dark:text-rose-400 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40"
                      }`}
                      title="Nghe phát âm chuẩn giọng đọc hệ thống"
                    >
                      {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      <span>{isSpeaking ? "Dừng" : "Phát âm"}</span>
                    </button>

                    {/* System Audio Settings Gear Button */}
                    <button
                      type="button"
                      onClick={() => setShowAudioSettingsModal(true)}
                      className="h-6 w-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
                      title="Cài đặt giọng đọc & âm thanh"
                    >
                      <Settings className="h-3 w-3" />
                    </button>

                    {/* Accordion Expand/Collapse Chevron */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="h-6 w-6 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-800"
                      title={isExpanded ? "Thu gọn chi tiết" : "Xem câu trả lời mẫu & từ vựng"}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Chinese Question & Pinyin */}
                <div className="space-y-1">
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {q.questionZh}
                  </p>
                  {showPinyin && q.pinyin && (
                    <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-sans font-medium">
                      {q.pinyin}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-0.5 leading-relaxed">
                    💡 <strong>Ý nghĩa & Hướng dẫn:</strong> {q.questionVi}
                  </p>
                </div>

                {/* Expanded Model Answer & Key Vocab */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-200">
                    {/* Model Answer Box */}
                    <div className="rounded-xl p-3.5 sm:p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Gợi ý trả lời chuẩn mẫu (Model Response)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(q.modelAnswerZh, `${q.id}_ans`)}
                          className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span>{activeSpeechId === `${q.id}_ans` ? "Dừng đọc" : "Nghe câu mẫu"}</span>
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                        {q.modelAnswerZh}
                      </p>
                      {showPinyin && q.modelAnswerPinyin && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-sans">
                          {q.modelAnswerPinyin}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        Dịch nghĩa: &quot;{q.modelAnswerVi}&quot;
                      </p>
                    </div>

                    {/* Key Vocab & Grammar Tips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {q.keyVocab && q.keyVocab.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Từ vựng then chốt (Key Vocabulary)
                          </span>
                          <div className="space-y-1">
                            {q.keyVocab.map((v, i) => (
                              <div key={i} className="flex items-baseline justify-between text-xs">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {v.zh}{" "}
                                  {showPinyin && (
                                    <span className="text-[11px] font-normal text-rose-600 font-sans">
                                      ({v.pinyin})
                                    </span>
                                  )}
                                </span>
                                <span className="text-slate-500 text-[11px]">{v.vi}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.grammarTip && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-rose-600" />
                            Điểm ngữ pháp & Cấu trúc ứng dụng
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {q.grammarTip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ====================================================================== */}
      {/* SYSTEM AUDIO & VOICE SETTINGS MODAL (Global Sync)                      */}
      {/* ====================================================================== */}
      {showAudioSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cài Đặt Giọng Đọc Hệ Thống
                  </h3>
                  <p className="text-[11px] text-slate-500">Áp dụng đồng bộ toàn hệ thống</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioSettingsModal(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Voice Selection */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Giọng đọc Giám khảo HSK:
                </label>
                <select
                  value={FIXED_VOICE_NAME}
                  onChange={() => {
                    const updated = saveSystemAudioSettings({ voiceName: FIXED_VOICE_NAME });
                    setAudioSettings(updated);
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

              {/* Playback Speed */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tốc độ phát âm chuẩn:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.85, 0.95, 1.05].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        const updated = saveSystemAudioSettings({ playbackSpeed: spd });
                        setAudioSettings(updated);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        audioSettings.playbackSpeed === spd
                          ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {spd}x {spd === 0.95 && "(Chuẩn)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinyin Default */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Hiển thị Pinyin kèm theo:
                </span>
                <button
                  type="button"
                  onClick={handleTogglePinyin}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    showPinyin
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800"
                  }`}
                >
                  {showPinyin ? "Bật" : "Tắt"}
                </button>
              </div>

              {/* Test Voice Sample */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSpeak("你好！这是系统的发音测试，祝你学习愉快。", "test_modal_voice")
                  }
                  className="text-xs h-8 rounded-xl"
                >
                  {activeSpeechId === "test_modal_voice" ? "Dừng thử" : "Thử nghe giọng"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAudioSettingsModal(false)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs h-8 px-4 font-bold"
                >
                  Đã lưu & Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
