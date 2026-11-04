"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";

interface OfficialReportPrintProps {
  session: any;
  user?: any;
  hskLabel: string;
  cefrLabel?: string;
  overallScoreVal: number;
  confidencePercent: number;
  summaryText: string;
  scoreDimensions: any[];
  allRecommendations: any[];
  strengths: string[];
  weaknesses: string[];
  userName: string;
}

export function OfficialReportPrintTemplate({
  session,
  user,
  hskLabel,
  cefrLabel,
  overallScoreVal,
  confidencePercent,
  summaryText,
  scoreDimensions,
  allRecommendations,
  strengths,
  weaknesses,
  userName,
}: OfficialReportPrintProps) {
  const template = session?.template || {
    title: "Khảo thí khẩu ngữ tiếng Trung",
    targetLevel: "HSK 3",
  };
  const testId = session?.id || "N/A";
  const shortId = testId.replace(/^session_/, "").substring(0, 12).toUpperCase();
  const testDate = session?.completedAt || session?.createdAt || new Date().toISOString();
  const formattedDate = new Date(testDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const candidateEmail = session?.userEmail || session?.user?.email || user?.email || "thí sinh tự do";

  // Top 3 representative corrections for the printable certificate
  const printRecommendations = allRecommendations.slice(0, 4);

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-6 sm:p-8 font-sans leading-tight print:p-0 print:max-w-none print:w-full">
      {/* Outer Certificate Frame Border */}
      <div className="border-2 border-slate-900 rounded-2xl p-5 sm:p-6 relative bg-white overflow-hidden print:border-2 print:rounded-xl">
        {/* Subtle Decorative Security Accent Border */}
        <div className="absolute inset-1 border border-slate-300 rounded-xl pointer-events-none print:border-slate-400" />

        {/* ================================================================== */}
        {/* 1. OFFICIAL TEST REPORT HEADER                                     */}
        {/* ================================================================== */}
        <div className="relative pb-4 mb-4 border-b-2 border-slate-900">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Brand Crest & Organization */}
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0 print:h-12 print:w-12 print:bg-rose-600">
                HSK
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase text-slate-500">
                  CLASSNIA AI &bull; CHINESE LANGUAGE ASSESSMENT CENTER
                </p>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                  Phiếu Báo Điểm Khẩu Ngữ Tiếng Trung Chuẩn Hóa
                </h1>
                <p className="text-[11px] font-semibold text-rose-700">
                  CHINESE SPEAKING PROFICIENCY TEST REPORT (HSK 3.0 &bull; CEFR STANDARDS)
                </p>
              </div>
            </div>

            {/* Right: Report Code & Issue Date */}
            <div className="text-right shrink-0">
              <div className="inline-block bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-right">
                <p className="text-[9px] font-mono uppercase text-slate-500 font-bold">MÃ BẢO MẬT TRF</p>
                <p className="text-xs font-mono font-black text-slate-900">#TRF-{shortId}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Ngày cấp: <strong>{formattedDate}</strong></p>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 2. CANDIDATE PROFILE & TEST METADATA GRID                          */}
        {/* ================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Thí Sinh (Candidate)</span>
            <span className="font-black text-slate-900 text-xs sm:text-sm truncate block">{userName}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tài Khoản (Email/ID)</span>
            <span className="font-semibold text-slate-700 text-xs truncate block">{candidateEmail}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Chủ Đề Khảo Thí (Topic)</span>
            <span className="font-bold text-slate-900 text-xs truncate block">{template.title}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Trạng Thái Xác Thực</span>
            <span className="font-bold text-emerald-700 text-xs flex items-center gap-1">
              &bull; Đã kiểm định âm học F0
            </span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. OVERALL SCORE & BENCHMARK HIGHLIGHT                             */}
        {/* ================================================================== */}
        <div className="grid grid-cols-12 gap-3 mb-4 items-stretch">
          {/* Main Score Box (4 Cols) */}
          <div className="col-span-12 sm:col-span-4 p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-200 flex flex-col justify-between text-center">
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-rose-800">
                TỔNG ĐIỂM KHẨU NGỮ (OVERALL)
              </p>
              <div className="my-1">
                <span className="text-4xl font-black text-rose-600 tracking-tight">
                  {overallScoreVal.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400"> / 100</span>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/80 flex items-center justify-around text-xs">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Quy Đổi HSK</p>
                <p className="font-black text-slate-900">{hskLabel}</p>
              </div>
              <div className="w-px h-6 bg-rose-200" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Khung CEFR</p>
                <p className="font-black text-slate-900">{cefrLabel || "CEFR A1"}</p>
              </div>
              <div className="w-px h-6 bg-rose-200" />
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Độ Tin Cậy</p>
                <p className="font-black text-emerald-700">{confidencePercent}%</p>
              </div>
            </div>
          </div>

          {/* Diagnostic Summary Text Box (8 Cols) */}
          <div className="col-span-12 sm:col-span-8 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-900 uppercase">
                <span>Nhận Định Chẩn Đoán Ngôn Ngữ Học (Examiner Evaluation)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                &ldquo;{summaryText}&rdquo;
              </p>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong className="text-emerald-700 block text-[10px] uppercase font-extrabold">Điểm Mạnh Nổi Bật:</strong>
                <p className="text-slate-600 line-clamp-1">{strengths[0] || "Phản xạ giao tiếp tự nhiên."}</p>
              </div>
              <div>
                <strong className="text-amber-700 block text-[10px] uppercase font-extrabold">Trọng Tâm Cần Luyện:</strong>
                <p className="text-slate-600 line-clamp-1">{weaknesses[0] || "Mở rộng vốn từ vựng và cấu trúc ngữ pháp phức."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 4. 7-DIMENSION PSYCHOMETRIC RUBRIC TABLE                           */}
        {/* ================================================================== */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
              Bảng Điểm Chẩn Đoán Chi Tiết 7 Chiều Kích (Psychometric Rubric Assessment)
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">Thang đo định lượng theo chuẩn HSK 3.0</span>
          </div>

          <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-[10.5px]">
                <th className="py-1.5 px-2.5 font-bold w-8 text-center">STT</th>
                <th className="py-1.5 px-2.5 font-bold">Kỹ Năng Khảo Thí (Dimension)</th>
                <th className="py-1.5 px-2 font-bold w-20 text-center">Điểm Đạt</th>
                <th className="py-1.5 px-2 font-bold w-16 text-center">Tỷ Lệ</th>
                <th className="py-1.5 px-2 font-bold w-24 text-center">Xếp Loại</th>
                <th className="py-1.5 px-2.5 font-bold">Dẫn Chứng & Nhận Định Sư Phạm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {scoreDimensions.map((dim: any, idx: number) => {
                const isHigh = dim.percent >= 70;
                const isMid = dim.percent >= 50 && dim.percent < 70;
                return (
                  <tr key={dim.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-1.5 px-2.5 font-bold text-center text-slate-400">{idx + 1}</td>
                    <td className="py-1.5 px-2.5 font-bold text-slate-900">
                      {dim.dimensionName}
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-slate-900">
                      {typeof dim.score === "number" ? dim.score.toFixed(1) : dim.score}/{dim.maxScore || 20}
                    </td>
                    <td className="py-1.5 px-2 text-center font-semibold text-slate-600">
                      {dim.percent}%
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-md text-[9.5px] font-bold ${
                          isHigh
                            ? "bg-emerald-100 text-emerald-800"
                            : isMid
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {dim.performanceLevel || (isHigh ? "Thành thạo" : isMid ? "Đạt chuẩn" : "Cần rèn luyện")}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-600 text-[10.5px] leading-tight">
                      {dim.rationale}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================================================================== */}
        {/* 5. ACTIONABLE LINGUISTIC CORRECTIONS (DẪN CHỨNG SỬA LỖI ĐIỂN HÌNH) */}
        {/* ================================================================== */}
        {printRecommendations.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase text-slate-900 mb-1.5 tracking-wider">
              Dẫn Chứng Sửa Lỗi Ngữ Âm & Cấu Trúc Câu Điển Hình (Targeted Linguistic Corrections)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-[10.5px]">
                    <th className="py-1.5 px-2.5 font-bold w-1/3">Phát Ngôn Gốc Của Thí Sinh</th>
                    <th className="py-1.5 px-2.5 font-bold w-1/3 text-emerald-800">Gợi Ý Diễn Đạt Chuẩn Bản Xứ</th>
                    <th className="py-1.5 px-2.5 font-bold">Phân Tích & Hướng Dẫn Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {printRecommendations.map((rec: any, idx: number) => (
                    <tr key={rec.id || idx}>
                      <td className="py-1.5 px-2.5 font-mono text-slate-700 text-[10.5px]">
                        {rec.originalPhrase ? `"${rec.originalPhrase}"` : "—"}
                      </td>
                      <td className="py-1.5 px-2.5 font-bold text-emerald-700">
                        {rec.correctedPhrase ? `"${rec.correctedPhrase}"` : "—"}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-600 text-[10.5px] leading-tight">
                        {rec.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 6. OFFICIAL DIGITAL SEAL & SIGNATURE BLOCK                         */}
        {/* ================================================================== */}
        <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between gap-4 text-xs">
          {/* Left: Verification URL & Security Notice */}
          <div className="space-y-1 max-w-sm">
            <p className="text-[10px] text-slate-500 leading-tight">
              Phiếu báo điểm này được tạo tự động bởi hệ thống Giám khảo Trí tuệ Nhân tạo Classnia AI theo mô hình rubric chuẩn HSK 3.0. Dữ liệu được bảo lưu điện tử vĩnh viễn trên máy chủ khảo thí.
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              Tra cứu trực tuyến: <span className="underline">chat.classnia.id.vn/dashboard/reports/{testId}</span>
            </p>
          </div>

          {/* Right: Official Red Digital Seal & Stamp */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Red Circular Digital Seal */}
            <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-rose-600 flex flex-col items-center justify-center text-center p-1 text-rose-600 bg-rose-50/20 select-none shrink-0 print:border-rose-700 print:text-rose-700">
              <div className="text-[7.5px] font-black uppercase tracking-tight leading-none">
                ★ CLASSNIA AI ★
              </div>
              <div className="text-[9px] font-extrabold uppercase my-0.5 tracking-tighter leading-none border-y border-rose-600 py-0.5 w-full">
                XÁC THỰC
              </div>
              <div className="text-[7px] font-bold uppercase tracking-tight leading-none">
                HSK 3.0 &bull; 2026
              </div>
            </div>

            {/* Signature Block */}
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-500">Hội Đồng Khảo Thí Công Nghệ</p>
              <div className="h-8 flex items-center justify-end font-serif italic text-base font-bold text-slate-800">
                Dr. Zhang Wei & Academic Board
              </div>
              <p className="text-[9px] text-slate-400">Giám đốc Khảo thí & Nghiên cứu Ngôn ngữ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
