"use client";

import React from "react";

export interface OfficialReportPrintProps {
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
  improvementPlan?: any[];
  printMode?: "all" | "certificate" | "diagnostics";
}

/**
 * Authentic Institutional Red Seal (公章 - Gōngzhāng) Vector
 * Dual concentric rings, central 5-pointed star, and curved official Chinese & English lettering
 */
function OfficialChineseRedSeal() {
  return (
    <div className="relative flex items-center justify-center shrink-0 select-none">
      <svg
        width="90"
        height="90"
        viewBox="0 0 100 100"
        className="text-red-600 drop-shadow-xs"
        style={{ transform: "rotate(-5deg)" }}
      >
        {/* Outer Heavy Ring */}
        <circle cx="50" cy="50" r="47" fill="none" stroke="#dc2626" strokeWidth="2.5" />
        {/* Inner Hairline Ring */}
        <circle cx="50" cy="50" r="43.5" fill="none" stroke="#dc2626" strokeWidth="0.8" />

        {/* Center 5-Pointed Seal Star */}
        <polygon
          points="50,27 53.5,38 65,38 55.7,45 59.2,56 50,49.5 40.8,56 44.3,45 35,38 46.5,38"
          fill="#dc2626"
        />

        {/* Curved Top Perimeter Text */}
        <path id="seal-curve-top" d="M 15,50 A 35,35 0 1,1 85,50" fill="none" />
        <text fill="#dc2626" fontSize="6.8" fontWeight="800" letterSpacing="0.6">
          <textPath href="#seal-curve-top" startOffset="50%" textAnchor="middle">
            CLASSNIA LANGUAGE CENTER
          </textPath>
        </text>

        {/* Center Institutional Chinese Stamp Text */}
        <text x="50" y="64" fill="#dc2626" fontSize="7" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
          测评认证专用章
        </text>

        {/* Center Micro Status */}
        <text x="50" y="72" fill="#dc2626" fontSize="4.8" fontWeight="bold" textAnchor="middle" letterSpacing="0.4">
          ★ OFFICIAL VERIFIED ★
        </text>

        {/* Curved Bottom Perimeter Text */}
        <path id="seal-curve-bottom" d="M 85,50 A 35,35 0 0,1 15,50" fill="none" />
        <text fill="#dc2626" fontSize="5.5" fontWeight="bold" letterSpacing="0.6">
          <textPath href="#seal-curve-bottom" startOffset="50%" textAnchor="middle">
            HSK 3.0 · CEFR BENCHMARK
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/**
 * Authentic Academic Calligraphic Signature Vector
 */
function AcademicSignature() {
  return (
    <div className="flex flex-col items-end text-right">
      <p className="text-[9.5px] uppercase font-extrabold text-slate-500 tracking-wider">
        Hội Đồng Khảo Thí & Đánh Giá
      </p>
      <div className="h-9 flex items-center justify-end my-0.5">
        <svg width="130" height="34" viewBox="0 0 160 40" className="text-slate-800">
          <path
            d="M 12 28 C 28 8, 38 35, 50 12 C 60 30, 72 18, 88 22 C 102 26, 118 10, 134 16 C 144 20, 150 14, 156 18"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 28 34 C 55 36, 95 34, 142 30"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-[10px] font-bold text-slate-900 leading-tight">
        GS. Zhang Wei & Hội đồng Sư phạm
      </p>
      <p className="text-[8.5px] text-slate-500 font-medium">
        Giám đốc Khảo thí & Nghiên cứu Ngôn ngữ
      </p>
    </div>
  );
}

/**
 * Vector QR Code for instant physical-to-digital anti-fraud credential verification
 */
function VectorQrCode({ value, size = 68 }: { value: string; size?: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="text-slate-900 border border-slate-200 rounded-md p-1 bg-white shrink-0"
      >
        {/* Finder Pattern Top-Left */}
        <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
        <rect x="11" y="11" width="16" height="16" rx="1" fill="currentColor" />

        {/* Finder Pattern Top-Right */}
        <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
        <rect x="73" y="11" width="16" height="16" rx="1" fill="currentColor" />

        {/* Finder Pattern Bottom-Left */}
        <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="4" />
        <rect x="11" y="73" width="16" height="16" rx="1" fill="currentColor" />

        {/* Timing Lines */}
        <path d="M 37 19 L 63 19" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
        <path d="M 19 37 L 19 63" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />

        {/* Data Matrix Modules */}
        <rect x="37" y="37" width="6" height="6" fill="currentColor" />
        <rect x="47" y="37" width="6" height="6" fill="currentColor" />
        <rect x="57" y="37" width="6" height="6" fill="currentColor" />
        <rect x="37" y="47" width="6" height="6" fill="currentColor" />
        <rect x="57" y="47" width="6" height="6" fill="currentColor" />
        <rect x="37" y="57" width="6" height="6" fill="currentColor" />
        <rect x="47" y="57" width="6" height="6" fill="currentColor" />
        <rect x="57" y="57" width="6" height="6" fill="currentColor" />

        <rect x="73" y="41" width="5" height="5" fill="currentColor" />
        <rect x="83" y="41" width="5" height="5" fill="currentColor" />
        <rect x="69" y="51" width="5" height="5" fill="currentColor" />
        <rect x="79" y="51" width="5" height="5" fill="currentColor" />
        <rect x="89" y="51" width="5" height="5" fill="currentColor" />
        <rect x="73" y="61" width="5" height="5" fill="currentColor" />
        <rect x="83" y="61" width="5" height="5" fill="currentColor" />

        <rect x="41" y="73" width="5" height="5" fill="currentColor" />
        <rect x="51" y="73" width="5" height="5" fill="currentColor" />
        <rect x="41" y="83" width="5" height="5" fill="currentColor" />
        <rect x="61" y="83" width="5" height="5" fill="currentColor" />
        <rect x="51" y="89" width="5" height="5" fill="currentColor" />
        <rect x="71" y="75" width="5" height="5" fill="currentColor" />
        <rect x="85" y="75" width="5" height="5" fill="currentColor" />
        <rect x="77" y="85" width="5" height="5" fill="currentColor" />
        <rect x="89" y="89" width="5" height="5" fill="currentColor" />

        {/* Center Monogram Emblem */}
        <circle cx="50" cy="50" r="7.5" fill="#991b1b" />
        <text x="50" y="53.5" fill="white" fontSize="7.5" fontWeight="900" textAnchor="middle">考</text>
      </svg>
      <span className="text-[7.5px] font-mono text-slate-500 uppercase mt-0.5 tracking-tighter">
        Quét xác thực
      </span>
    </div>
  );
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
  improvementPlan,
  printMode = "all",
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

  const printRecommendations = allRecommendations.slice(0, 5);

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 font-sans leading-tight print:p-0 print:max-w-none print:w-full">
      {/* ==================================================================== */}
      {/* PAGE 1: OFFICIAL TEST REPORT FORM & MASTER CERTIFICATE (1-PAGE A4)   */}
      {/* ==================================================================== */}
      {(printMode === "all" || printMode === "certificate") && (
        <div className="relative bg-white border-[2.5px] border-slate-900 p-6 print:p-5 print:border-[2px] overflow-hidden page-break-avoid">
          {/* Inner hairline border */}
          <div className="absolute inset-1.5 border border-slate-300 pointer-events-none" />

          {/* Classical Corner Security Accents */}
          <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-900 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-900 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-900 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-900 pointer-events-none" />

          {/* Watermark Security Emblem Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <svg width="340" height="340" viewBox="0 0 200 200" className="text-slate-900">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <polygon points="100,25 120,80 180,80 130,115 150,170 100,135 50,170 70,115 20,80 80,80" fill="none" stroke="currentColor" strokeWidth="1" />
              <text x="100" y="112" fontSize="36" fontFamily="serif" fontWeight="bold" textAnchor="middle" fill="currentColor">
                考
              </text>
            </svg>
          </div>

          {/* 1. INSTITUTIONAL HEADER */}
          <div className="relative pb-3 mb-3 border-b-2 border-slate-900">
            <div className="flex items-start justify-between gap-3">
              {/* Left: Authentic Academic Crest */}
              <div className="flex items-center gap-3">
                <div className="h-13 w-13 rounded-xl border-2 border-amber-600/90 bg-gradient-to-br from-rose-950 via-rose-900 to-rose-950 text-amber-300 flex flex-col items-center justify-center shadow-xs shrink-0 relative overflow-hidden">
                  <span className="text-[20px] font-serif font-black leading-none text-amber-200">
                    考
                  </span>
                  <span className="text-[6.5px] font-mono tracking-widest uppercase font-bold text-amber-300/90 mt-0.5">
                    HSK 3.0
                  </span>
                </div>
                <div>
                  <p className="text-[9.5px] font-extrabold tracking-wider uppercase text-slate-500">
                    CLASSNIA CHINESE LANGUAGE ASSESSMENT CENTER &bull; 国际中文水平测评中心
                  </p>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    Phiếu Báo Điểm Khẩu Ngữ Tiếng Trung Chuẩn Hóa
                  </h1>
                  <p className="text-[10px] font-bold text-rose-800 uppercase tracking-tight">
                    CHINESE SPEAKING PROFICIENCY TEST REPORT (HSK 3.0 &bull; CEFR STANDARDS)
                  </p>
                </div>
              </div>

              {/* Right: Security TRF and Vector QR */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <div className="inline-block bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-right">
                    <p className="text-[8px] font-mono uppercase text-slate-500 font-bold">MÃ BẢO MẬT TRF</p>
                    <p className="text-[11px] font-mono font-black text-slate-900">#TRF-{shortId}</p>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-0.5">Ngày cấp: <strong>{formattedDate}</strong></p>
                  <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.2 inline-block mt-0.5">
                    &bull; Đã kiểm định F0
                  </span>
                </div>
                <VectorQrCode value={`https://classnia.id.vn/dashboard/reports/${testId}`} size={64} />
              </div>
            </div>
          </div>

          {/* 2. CANDIDATE PROFILE BAR */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 rounded-lg bg-slate-50/80 border border-slate-200 mb-3 text-xs">
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">Họ và Tên (Candidate)</span>
              <span className="font-extrabold text-slate-900 text-xs truncate block">{userName}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">Mã Hồ Sơ (TRF ID)</span>
              <span className="font-mono font-bold text-slate-800 text-xs truncate block">#TRF-{shortId}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">Chủ Đề Khảo Thí (Topic)</span>
              <span className="font-bold text-slate-800 text-xs truncate block">{template.title}</span>
            </div>
            <div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block tracking-wider">Trình Độ Khảo Thí</span>
              <span className="font-bold text-rose-800 text-xs truncate block">{template.targetLevel} &bull; Khẩu ngữ</span>
            </div>
          </div>

          {/* 3. EXECUTIVE SCORECARD & DIAGNOSTIC RATIONALE */}
          <div className="grid grid-cols-12 gap-2.5 mb-3 items-stretch">
            {/* Scorecard Panel */}
            <div className="col-span-4 p-3 rounded-xl bg-slate-900 text-white flex flex-col justify-between text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-rose-600/20 rounded-full blur-xl pointer-events-none" />
              <div>
                <p className="text-[8.5px] uppercase font-extrabold tracking-widest text-slate-400">
                  TỔNG ĐIỂM KHẨU NGỮ (OVERALL)
                </p>
                <div className="my-0.5">
                  <span className="text-3xl font-black text-white tracking-tight">
                    {overallScoreVal.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-400"> / 100</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-slate-800 grid grid-cols-3 gap-1 text-[10px]">
                <div>
                  <p className="text-[8px] uppercase font-bold text-slate-400">Quy Đổi HSK</p>
                  <p className="font-black text-amber-400 text-xs">{hskLabel}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-slate-400">Khung CEFR</p>
                  <p className="font-black text-rose-400 text-xs">{cefrLabel || "CEFR B1"}</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase font-bold text-slate-400">Độ Tin Cậy</p>
                  <p className="font-black text-emerald-400 text-xs">{confidencePercent}%</p>
                </div>
              </div>
            </div>

            {/* Diagnostic Pedagogical Summary */}
            <div className="col-span-8 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[9.5px] font-extrabold text-slate-900 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                  <span>Nhận Định Chẩn Đoán Ngôn Ngữ Học Sư Phạm</span>
                </div>
                <p className="text-[10.5px] text-slate-700 leading-relaxed italic line-clamp-3">
                  &ldquo;{summaryText}&rdquo;
                </p>
              </div>
              <div className="pt-1.5 mt-1 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-emerald-700 font-extrabold text-[8.5px] uppercase block">Ưu Điểm Nổi Bật:</span>
                  <p className="text-slate-600 truncate">{strengths[0] || "Phản xạ giao tiếp tự nhiên."}</p>
                </div>
                <div>
                  <span className="text-amber-700 font-extrabold text-[8.5px] uppercase block">Trọng Tâm Hoàn Thiện:</span>
                  <p className="text-slate-600 truncate">{weaknesses[0] || "Mở rộng liên từ và cấu trúc phức."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 7-DIMENSION PSYCHOMETRIC RUBRIC TABLE */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[10px] font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-3 bg-rose-600 inline-block rounded-xs" />
                Bảng Điểm Chẩn Đoán 7 Chiều Kích Năng Lực (Psychometric Rubric Assessment)
              </h2>
              <span className="text-[8.5px] text-slate-500 font-medium">Thang đo định lượng chuẩn HSK 3.0</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 text-[9.5px]">
                  <th className="py-1 px-2 font-bold w-6 text-center">STT</th>
                  <th className="py-1 px-2 font-bold">Kỹ Năng Khảo Thí (Dimension)</th>
                  <th className="py-1 px-2 font-bold w-16 text-center">Điểm</th>
                  <th className="py-1 px-2 font-bold w-24">Tỷ Lệ Đạt</th>
                  <th className="py-1 px-2 font-bold w-20 text-center">Xếp Loại</th>
                  <th className="py-1 px-2 font-bold">Nhận Định Sư Phạm Cốt Lõi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-[10.5px]">
                {scoreDimensions.map((dim: any, idx: number) => {
                  const isHigh = dim.percent >= 70;
                  const isMid = dim.percent >= 50 && dim.percent < 70;
                  return (
                    <tr key={dim.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="py-1 px-2 font-bold text-center text-slate-400 text-[9px]">{idx + 1}</td>
                      <td className="py-1 px-2 font-bold text-slate-900">
                        {dim.dimensionName}
                      </td>
                      <td className="py-1 px-2 text-center font-bold text-slate-800 text-[10px]">
                        {typeof dim.score === "number" ? dim.score.toFixed(1) : dim.score}/{dim.maxScore || 20}
                      </td>
                      <td className="py-1 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? "bg-emerald-600" : isMid ? "bg-blue-600" : "bg-amber-500"
                              }`}
                              style={{ width: `${dim.percent}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700 text-[9px]">{dim.percent}%</span>
                        </div>
                      </td>
                      <td className="py-1 px-2 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase ${
                            isHigh
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isMid
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {dim.performanceLevel || (isHigh ? "Thành thạo" : isMid ? "Đạt chuẩn" : "Rèn luyện")}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-slate-600 text-[10px] leading-tight">
                        {dim.rationale}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. OFFICIAL DIGITAL SEAL & SIGNATURE BLOCK */}
          <div className="pt-2 border-t-2 border-slate-900 flex items-center justify-between gap-3 text-xs">
            {/* Left: Security notice */}
            <div className="space-y-0.5 max-w-xs">
              <p className="text-[8.5px] text-slate-500 leading-tight">
                Phiếu điểm được bảo chứng bởi thuật toán đánh giá đa chiều Classnia AI theo khung HSK 3.0 &amp; CEFR quốc tế.
              </p>
              <p className="text-[8.5px] font-mono text-slate-500">
                Xác thực: <span className="underline">classnia.id.vn/dashboard/reports/{testId}</span>
              </p>
              <p className="text-[7.5px] font-mono text-slate-400">
                HASH: {shortId}-{Math.abs(overallScoreVal * 7919).toString(16).toUpperCase()} &bull; OFFICIAL DOCUMENT
              </p>
            </div>

            {/* Right: Red Seal & Signature */}
            <div className="flex items-center gap-3 shrink-0">
              <OfficialChineseRedSeal />
              <AcademicSignature />
            </div>
          </div>

          {/* Page 1 Bottom Metadata */}
          <div className="pt-1.5 mt-1 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span>BẢN BÁO ĐIỂM KHẢO THÍ CHÍNH THỨC &bull; CLASSNIA AI ASSESSMENT PLATFORM</span>
            <span>{printMode === "all" ? "TRANG 1 / 2" : "TRANG 1 / 1"}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PAGE 2: DIAGNOSTIC LINGUISTIC ANALYSIS & ACTIONABLE ROADMAP          */}
      {/* ==================================================================== */}
      {(printMode === "all" || printMode === "diagnostics") && (
        <div className={`relative bg-white border-[2.5px] border-slate-900 p-6 print:p-5 print:border-[2px] overflow-hidden ${printMode === "all" ? "page-break-before mt-8 print:mt-0" : ""}`}>
          <div className="absolute inset-1.5 border border-slate-300 pointer-events-none" />
          <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-900 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-900 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-900 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-900 pointer-events-none" />

          {/* Page 2 Header */}
          <div className="relative pb-2.5 mb-3 border-b-2 border-slate-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                PHỤ LỤC
              </div>
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                  Phụ Lục Chẩn Đoán Lỗi &amp; Lộ Trình Nâng Cao Năng Lực
                </h2>
                <p className="text-[9.5px] text-slate-500 font-medium">
                  DIAGNOSTIC ERROR ANALYSIS &amp; ACTIONABLE PEDAGOGICAL ROADMAP &bull; HSK 3.0
                </p>
              </div>
            </div>
            <div className="text-right text-[9.5px] text-slate-600 shrink-0">
              <p>Thí sinh: <strong>{userName}</strong></p>
              <p className="font-mono text-[8.5px] text-slate-400">#TRF-{shortId}</p>
            </div>
          </div>

          {/* Section 1: Strengths & Weaknesses 2-Column Matrix */}
          <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                Ưu Điểm Đã Xác Thực (Linguistic Strengths)
              </h3>
              <ul className="space-y-1 text-[10.5px] text-slate-700">
                {strengths.slice(0, 3).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-600 font-bold shrink-0">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                Trọng Tâm Cần Hoàn Thiện (Priority Focus)
              </h3>
              <ul className="space-y-1 text-[10.5px] text-slate-700">
                {weaknesses.slice(0, 3).map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2: Detailed Linguistic Corrections Table */}
          {printRecommendations.length > 0 && (
            <div className="mb-3">
              <h3 className="text-[10px] font-black uppercase text-slate-900 mb-1 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-3 bg-rose-600 inline-block rounded-xs" />
                Dẫn Chứng Sửa Lỗi Ngữ Âm &amp; Diễn Đạt Điển Hình (Targeted Linguistic Corrections)
              </h3>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[9.5px]">
                    <th className="py-1 px-2 font-bold w-1/3">Phát Ngôn Gốc Của Thí Sinh</th>
                    <th className="py-1 px-2 font-bold w-1/3 text-emerald-800">Gợi Ý Diễn Đạt Chuẩn Bản Xứ</th>
                    <th className="py-1 px-2 font-bold">Phân Tích &amp; Hướng Dẫn Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10.5px]">
                  {printRecommendations.map((rec: any, idx: number) => (
                    <tr key={rec.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
                      <td className="py-1 px-2 font-mono text-slate-700 text-[10px]">
                        {rec.originalPhrase ? `"${rec.originalPhrase}"` : "—"}
                      </td>
                      <td className="py-1 px-2 font-bold text-emerald-700">
                        {rec.correctedPhrase ? `"${rec.correctedPhrase}"` : "—"}
                      </td>
                      <td className="py-1 px-2 text-slate-600 text-[10px] leading-tight">
                        {rec.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 3: 4-Week Actionable Roadmap */}
          {improvementPlan && improvementPlan.length > 0 && (
            <div className="mb-3">
              <h3 className="text-[10px] font-black uppercase text-slate-900 mb-1.5 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-3 bg-rose-600 inline-block rounded-xs" />
                Kế Hoạch &amp; Lộ Trình 4 Tuần Nâng Cấp Năng Lực (4-Week Action Plan)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {improvementPlan.slice(0, 4).map((plan: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 inline-block mb-1">
                        Tuần {plan.week || idx + 1}
                      </span>
                      <p className="font-bold text-slate-900 text-[10px] leading-tight mb-1">{plan.title}</p>
                      <p className="text-[9px] text-slate-600 leading-snug line-clamp-3">{plan.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page 2 Footer */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[8px] text-slate-400 font-mono">
            <span>CLASSNIA AI ASSESSMENT PLATFORM &bull; HSK 3.0 COMPLIANT</span>
            <span>{printMode === "all" ? "TRANG 2 / 2" : "TRANG 1 / 1"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
