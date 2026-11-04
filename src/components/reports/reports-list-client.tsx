"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ChevronRight } from "lucide-react";
import { formatDate, formatScore } from "@/lib/utils";

function getBrowserLocalSessions(): any[] {
  if (typeof window === "undefined") return [];
  const foundMap = new Map<string, any>();

  // 1. Check aihsk_recent_sessions
  try {
    const raw = localStorage.getItem("aihsk_recent_sessions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          if (s && s.id) foundMap.set(s.id, s);
        }
      }
    }
  } catch {}

  // 2. Scan all aihsk_active_session_* keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("aihsk_active_session_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const s = JSON.parse(raw);
            if (s && s.id) {
              const existing = foundMap.get(s.id);
              if (!existing || (!existing.result && s.result)) {
                foundMap.set(s.id, s);
              }
            }
          }
        } catch {}
      }
    }
  } catch {}

  return Array.from(foundMap.values());
}

export function ReportsListClient({ initialSessions }: { initialSessions: any[] }) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);

  useEffect(() => {
    const localList = getBrowserLocalSessions();
    const mergedMap = new Map<string, any>();

    for (const s of initialSessions) {
      if (s && s.id) mergedMap.set(s.id, s);
    }

    let hasNewSync = false;
    for (const ls of localList) {
      if (!ls || !ls.id) continue;
      const serverS = mergedMap.get(ls.id);
      if (!serverS) {
        mergedMap.set(ls.id, ls);
        hasNewSync = true;
        fetch(`/api/assessments/${ls.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: ls }),
        }).catch(() => null);
      } else if (!serverS.result && ls.result) {
        mergedMap.set(ls.id, { ...serverS, ...ls });
        hasNewSync = true;
        fetch(`/api/assessments/${ls.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: ls }),
        }).catch(() => null);
      }
    }

    if (hasNewSync || localList.length > 0) {
      const sorted = Array.from(mergedMap.values())
        .filter((s: any) => s.result || s.status === "COMPLETED" || s.status === "PROCESSING")
        .sort((a, b) => new Date(b.completedAt || b.createdAt || 0).getTime() - new Date(a.completedAt || a.createdAt || 0).getTime());
      setSessions(sorted);
    }
  }, [initialSessions]);

  if (sessions.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 text-center p-8 sm:p-14 rounded-3xl shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Chưa có bài thi nào hoàn thành
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
          Hãy tham gia bài thi phỏng vấn nói 5 giai đoạn đầu tiên cùng Giám khảo AI Lý để nhận báo cáo chẩn đoán chi tiết.
        </p>
        <Link href="/dashboard/assessments">
          <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-6 rounded-2xl shadow-sm">
            Bắt đầu làm bài thi &rarr;
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {sessions.map((session) => {
        const result = session.result;
        const hskLabel = result?.hskEstimate || result?.hskLevel || session.template?.targetLevel || "HSK";
        const cefrLabel = result?.cefrEstimate || result?.cefrLevel;
        const summaryText =
          result?.performanceSummary ||
          result?.feedbackSummary ||
          session.template?.description ||
          "Báo cáo chẩn đoán khẩu ngữ tiếng Trung.";
        const isFreeTalk = session.template?.category === "FREE_TALK" || session.id?.startsWith("freetalk-");

        return (
          <Card
            key={session.id}
            className="border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs"
          >
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="cinnabar" className="text-[10px] font-bold">
                    {hskLabel}
                  </Badge>
                  {cefrLabel && (
                    <Badge variant="outline" className="text-[10px] font-bold">
                      CEFR {cefrLabel}
                    </Badge>
                  )}
                  {isFreeTalk && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      Trò chuyện tự do
                    </Badge>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3" />
                    {formatDate(session.completedAt || session.createdAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {session.template?.title || (isFreeTalk ? "Trò Chuyện Tự Do" : "Bài khảo thí khẩu ngữ")}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                  {summaryText}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                {result ? (
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Tổng điểm
                    </span>
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-500">
                      {formatScore(result.overallScore)}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </div>
                  </div>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    Đang xử lý
                  </Badge>
                )}

                <Link href={`/dashboard/reports/${session.id}`}>
                  <Button
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-rose-600 dark:hover:bg-rose-700 font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-xs"
                  >
                    <span>Chi tiết</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
