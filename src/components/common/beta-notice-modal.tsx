"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  AlertTriangle,
  HelpCircle,
  X,
  Clock,
  CheckCircle2,
  Bug,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DISMISSED_KEY = "aihsk_beta_notice_dismissed_until";
const SESSION_CLOSED_KEY = "aihsk_beta_notice_closed_session";

export function BetaNoticeModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed in last 24 hours
    try {
      const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return;
      }

      // Check if temporarily closed in current session
      const sessionClosed = sessionStorage.getItem(SESSION_CLOSED_KEY);
      if (sessionClosed === "1") {
        return;
      }

      // Smooth delayed popup after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);

      return () => clearTimeout(timer);
    } catch {
      // In case of restricted storage
    }
  }, []);

  if (!isOpen) return null;

  const handleDismiss24h = () => {
    try {
      const twentyFourHours = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISSED_KEY, twentyFourHours.toString());
    } catch (e) {
      console.warn("Storage note:", e);
    }
    setIsOpen(false);
  };

  const handleCloseTemporary = () => {
    try {
      sessionStorage.setItem(SESSION_CLOSED_KEY, "1");
    } catch (e) {
      console.warn("Storage note:", e);
    }
    setIsOpen(false);
  };

  const handleGoToSupport = () => {
    handleCloseTemporary();
    router.push("/dashboard/support");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="beta-modal-title"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Subtle decorative top accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-3 sm:pb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px] font-bold uppercase tracking-wider"
                >
                  Phiên Bản Beta
                </Badge>
                <span className="text-[11px] font-semibold text-slate-400">v1.0 Public Test</span>
              </div>
              <h2
                id="beta-modal-title"
                className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1 leading-snug"
              >
                Thông Báo Thử Nghiệm Hệ Thống
              </h2>
            </div>
          </div>

          {/* Close button (X) */}
          <button
            type="button"
            onClick={handleCloseTemporary}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Đóng thông báo"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 sm:px-6 py-2 space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Chào mừng bạn đến với <strong>Classnia AI HSK</strong>! Hệ thống hiện đang được vận hành dưới dạng <strong>Bản Thử Nghiệm (Beta Test)</strong> nhằm kiểm tra độ chịu tải và chuẩn hóa khả năng đàm thoại của Giám khảo AI.
          </p>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Nếu gặp lỗi hoặc cần hỗ trợ trong lúc thi:</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-amber-800/90 dark:text-amber-300/90">
              <li>
                <strong>Lỗi âm thanh / Micro / Kết nối phòng thi:</strong> Hãy bấm gửi báo lỗi kèm mã phòng thi để đội ngũ kỹ thuật hỗ trợ bạn.
              </li>
              <li>
                <strong>Góp ý điểm số & chất lượng Giám khảo AI:</strong> Chúng tôi luôn tiếp thu để tinh chỉnh prompt sư phạm chuẩn HSKK.
              </li>
              <li>
                Mọi vấn đề đều có thể báo cáo trực tiếp trong tab <strong>Yêu Cầu & Hỗ Trợ</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Secondary actions: Dismiss for 24h or temporary */}
          <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDismiss24h}
              className="flex-1 sm:flex-none text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-9 gap-1.5"
              title="Không hiển thị lại thông báo này trong 24 giờ tới"
            >
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Tắt trong 24h</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseTemporary}
              className="flex-1 sm:flex-none text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl h-9"
            >
              Đóng lần này
            </Button>
          </div>

          {/* Primary Action: Go to Support & Ticket Page */}
          <Button
            type="button"
            size="sm"
            onClick={handleGoToSupport}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs rounded-xl h-9 px-4 gap-1.5 shadow-xs shadow-rose-600/30"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Vào Yêu Cầu & Hỗ Trợ &rarr;</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
