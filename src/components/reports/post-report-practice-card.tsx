"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PracticeQuestion } from "@/lib/practice/practice-bank-generator";

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

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (activeSpeechId === id) {
      setActiveSpeechId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;

    utterance.onstart = () => setActiveSpeechId(id);
    utterance.onend = () => setActiveSpeechId(null);
    utterance.onerror = () => setActiveSpeechId(null);

    window.speechSynthesis.speak(utterance);
  };

  if (!questions || questions.length === 0) return null;

  return (
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

          <Link href={`/dashboard/free-talk?initialTopic=${encodeURIComponent(topicTitle)}`}>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Luyện nói Free-Talk</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </Link>
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
              {/* Question Header & Category */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                    {q.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSpeak(q.questionZh, q.id)}
                    className={`h-7 px-2 text-xs font-semibold rounded-lg gap-1 ${
                      isSpeaking
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse"
                        : "text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-300"
                    }`}
                    title="Nghe phát âm chuẩn câu hỏi"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{isSpeaking ? "Đang đọc..." : "Phát âm"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Chinese Question & Pinyin */}
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {q.questionZh}
                </p>
                {q.pinyin && (
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
                        <span>Nghe câu mẫu</span>
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.modelAnswerZh}
                    </p>
                    {q.modelAnswerPinyin && (
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
                                {v.zh} <span className="text-[11px] font-normal text-rose-600 font-sans">({v.pinyin})</span>
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
  );
}
