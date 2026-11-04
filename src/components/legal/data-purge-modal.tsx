"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DataPurgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isPurging: boolean;
}

export function DataPurgeModal({
  isOpen,
  onClose,
  onConfirm,
  isPurging,
}: DataPurgeModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isPurging) return;
    setConfirmed(false);
    onClose();
  };

  const handleExecute = async () => {
    if (!confirmed || isPurging) return;
    await onConfirm();
    setConfirmed(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isPurging}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="cinnabar" className="text-[10px] py-0.5">
                Nghị Định 13/2023/NĐ-CP & GDPR
              </Badge>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
              Yêu Cầu Xóa Lịch Sử & Dữ Liệu Âm Thanh
            </h3>
            <p className="text-xs text-slate-500">
              Quyền được lãng quên (Right to be Forgotten)
            </p>
          </div>
        </div>

        {/* Warning callout */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200 text-xs space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Hành động này không thể hoàn tác:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-rose-900/90 dark:text-rose-300/90">
            <li>Toàn bộ file ghi âm giọng nói micro từ các bài khảo thí sẽ bị tiêu hủy.</li>
            <li>Biên bản thoại, chẩn đoán âm học F0 và thang điểm 7 chiều sẽ bị xóa vĩnh viễn.</li>
            <li>Dữ liệu luyện tập củng cố sau báo cáo sẽ được làm mới.</li>
          </ul>
        </div>

        {/* Confirm Checkbox */}
        <div
          onClick={() => !isPurging && setConfirmed(!confirmed)}
          className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 cursor-pointer select-none hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors"
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={confirmed}
            onClick={(e) => {
              e.stopPropagation();
              if (!isPurging) setConfirmed(!confirmed);
            }}
            className={`h-4.5 w-4.5 mt-0.5 rounded-[5px] flex items-center justify-center shrink-0 transition-all ${
              confirmed
                ? "bg-[#e06b53] text-white shadow-xs"
                : "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
            }`}
          >
            {confirmed && <Check className="h-3 w-3 stroke-[3]" />}
          </button>
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-tight">
            <span className="font-semibold block mb-0.5">Xác nhận yêu cầu tiêu hủy</span>
            <span className="text-[11px] text-slate-500">
              Tôi hiểu rõ việc xóa dữ liệu là vĩnh viễn và không thể phục hồi.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPurging}
            className="text-xs h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700"
          >
            Hủy Bỏ / Giữ Lại
          </Button>

          <Button
            type="button"
            onClick={handleExecute}
            disabled={!confirmed || isPurging}
            className={`text-xs h-10 px-5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              confirmed
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
                : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
            }`}
          >
            {isPurging ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang Tiêu Hủy...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
