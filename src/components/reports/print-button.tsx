"use client";

import { useState } from "react";
import { Printer, Eye, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  onPreviewClick?: () => void;
}

export function PrintButton({ onPreviewClick }: PrintButtonProps) {
  const handlePrint = () => {
    // Smooth print trigger
    window.print();
  };

  return (
    <div className="flex items-center gap-1.5 print:hidden">
      {onPreviewClick && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPreviewClick}
          className="text-xs flex items-center gap-1.5 h-8 px-2.5 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          title="Xem trước mẫu phiếu điểm chuẩn A4 trước khi in"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          <span>Xem Trước Bản Điểm</span>
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        onClick={handlePrint}
        className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 h-8 px-3 rounded-xl shadow-xs"
        title="In hoặc Lưu dưới dạng tệp PDF chuẩn hóa"
      >
        <Printer className="h-3.5 w-3.5" />
        <span>Xuất PDF / In Ấn</span>
      </Button>
    </div>
  );
}
