"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, RefreshCw, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportRecovery({ sessionId }: { sessionId: string }) {
  const [isRecovering, setIsRecovering] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Đang kiểm tra và đồng bộ dữ liệu phiên thi...");
  const [failed, setFailed] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function attemptRecovery() {
      if (typeof window === "undefined" || attemptedRef.current) return;
      attemptedRef.current = true;

      // Prevent infinite loop if already reloaded twice for this session
      const recoveryKey = `aihsk_recovery_count_${sessionId}`;
      const count = parseInt(sessionStorage.getItem(recoveryKey) || "0", 10);
      if (count >= 3) {
        if (isMounted) {
          setIsRecovering(false);
          setFailed(true);
        }
        return;
      }
      sessionStorage.setItem(recoveryKey, String(count + 1));

      try {
        const cached = localStorage.getItem(`aihsk_active_session_${sessionId}`);
        if (!cached) {
          // Poll server API a few times in case background worker is finalizing
          for (let i = 0; i < 4; i++) {
            if (!isMounted) return;
            setStatusMessage(`Đang tải báo cáo đánh giá... (${i + 1}/4)`);
            const checkRes = await fetch(`/api/assessments/${sessionId}`);
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData?.session?.result) {
                setStatusMessage("Báo cáo đã sẵn sàng! Đang hiển thị...");
                sessionStorage.removeItem(recoveryKey);
                window.location.reload();
                return;
              }
            }
            await new Promise((r) => setTimeout(r, 1200));
          }

          if (isMounted) {
            setIsRecovering(false);
            setFailed(true);
          }
          return;
        }

        const sessionData = JSON.parse(cached);
        if (isMounted) {
          setStatusMessage("Đã tìm thấy bản ghi bài thi từ thiết bị của bạn. Đang tái tạo báo cáo...");
        }

        const res = await fetch(`/api/assessments/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: sessionData }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStatusMessage("Đồng bộ thành công! Đang tải báo cáo đánh giá...");
            if (data?.session) {
              try {
                localStorage.setItem(`aihsk_active_session_${sessionId}`, JSON.stringify(data.session));
              } catch {}
            }
            sessionStorage.removeItem(recoveryKey);
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
          return;
        }
      } catch (e) {
        console.warn("Client recovery attempt error:", e);
      }

      if (isMounted) {
        setIsRecovering(false);
        setFailed(true);
      }
    }

    attemptRecovery();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  if (isRecovering) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center animate-spin">
          <Loader2 className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Đang tải báo cáo đánh giá
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {statusMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-6 text-center max-w-md mx-auto">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
        <FileQuestion className="h-7 w-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Không tìm thấy báo cáo bài thi
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Phiên thi <span className="font-mono text-slate-700 dark:text-slate-300">({sessionId})</span> chưa hoàn tất chấm điểm hoặc dữ liệu đang được đồng bộ.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            sessionStorage.removeItem(`aihsk_recovery_count_${sessionId}`);
            window.location.reload();
          }}
          className="rounded-xl text-xs gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Thử tải lại</span>
        </Button>
        <Link href="/dashboard/assessments">
          <Button variant="default" size="sm" className="rounded-xl text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Về danh sách bài thi</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
