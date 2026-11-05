"use client";

import React, { useMemo } from "react";
import QRCode from "qrcode";

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
 * Genuine, 100% Scannable QR Code Vector Generator.
 * Uses QRCode.create to synchronously compute the exact ISO/IEC 18004 data matrix
 * and renders a pure SVG path that scales infinitely with crisp edges for high-DPI print.
 */
function ScannableQrCode({ value, size = 68 }: { value: string; size?: number }) {
  const qrData = useMemo(() => {
    try {
      const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
      const moduleCount = qr.modules.size;
      const margin = 1;
      const total = moduleCount + margin * 2;
      let path = "";

      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.modules.get(r, c)) {
            path += `M${c + margin},${r + margin}h1v1h-1z `;
          }
        }
      }

      return { total, path };
    } catch {
      return { total: 33, path: "" };
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center shrink-0 select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${qrData.total} ${qrData.total}`}
        shapeRendering="crispEdges"
        className="border border-slate-300 rounded bg-white p-0.5 shrink-0"
      >
        <rect width={qrData.total} height={qrData.total} fill="#ffffff" />
        <path d={qrData.path} fill="#0f172a" />
      </svg>
      <span className="text-[7.5px] font-mono font-semibold text-slate-500 uppercase mt-0.5 tracking-tighter text-center">
        Quét xác thực
      </span>
    </div>
  );
}

/**
 * Official Classnia HSK Brand Emblem (High-Resolution Vector)
 * Uses the exact emerald institutional theme, golden star, and standard HSK 1-9 typography.
 */
function OfficialBrandLogo({ size = 48 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl shadow-xs select-none"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 512 512" width="100%" height="100%">
        <defs>
          <linearGradient id="printHskBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="printGoldStar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <rect width="512" height="512" rx="100" fill="url(#printHskBg)" />
        <rect
          x="12"
          y="12"
          width="488"
          height="488"
          rx="90"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.25"
          strokeWidth="8"
        />

        {/* Watermark Hanzi */}
        <text
          x="256"
          y="190"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="115"
          fontWeight="900"
          fill="#ffffff"
          fillOpacity="0.14"
          textAnchor="middle"
          dominantBaseline="central"
        >
          汉语
        </text>

        {/* Main HSK Typography */}
        <text
          x="256"
          y="280"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="180"
          fontWeight="900"
          letterSpacing="-3"
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="central"
        >
          HSK
        </text>

        {/* Golden Star Accent */}
        <g transform="translate(390, 125) scale(0.65)">
          <polygon
            points="25,1 32,17 49,17 35,27 40,44 25,33 10,44 15,27 1,17 18,17"
            fill="url(#printGoldStar)"
          />
        </g>

        {/* Level 1-9 Badge */}
        <rect x="166" y="385" width="180" height="42" rx="21" fill="#ffffff" fillOpacity="0.25" />
        <text
          x="256"
          y="406"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="21"
          fontWeight="800"
          letterSpacing="3"
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="central"
        >
          LEVEL 1-9
        </text>
      </svg>
    </div>
  );
}

/**
 * Authentic Institutional Red Seal (公章 - Official Certification Stamp)
 * Dual concentric hairline rings with central star and official bilingual council text.
 */
function OfficialChineseRedSeal() {
  return (
    <div className="relative flex items-center justify-center shrink-0 select-none">
      <svg
        width="86"
        height="86"
        viewBox="0 0 100 100"
        className="text-red-600"
        style={{ transform: "rotate(-3deg)" }}
      >
        {/* Outer Solid Ring */}
        <circle cx="50" cy="50" r="47" fill="none" stroke="#dc2626" strokeWidth="2.2" />
        {/* Inner Hairline Ring */}
        <circle cx="50" cy="50" r="43.5" fill="none" stroke="#dc2626" strokeWidth="0.8" />

        {/* Center 5-Pointed Seal Star */}
        <polygon
          points="50,27 53.5,38 65,38 55.7,45 59.2,56 50,49.5 40.8,56 44.3,45 35,38 46.5,38"
          fill="#dc2626"
        />

        {/* Curved Top Perimeter Text */}
        <path id="seal-curve-top" d="M 15,50 A 35,35 0 1,1 85,50" fill="none" />
        <text fill="#dc2626" fontSize="6.5" fontWeight="800" letterSpacing="0.6">
          <textPath href="#seal-curve-top" startOffset="50%" textAnchor="middle">
            CLASSNIA ASSESSMENT COUNCIL
          </textPath>
        </text>

        {/* Center Institutional Chinese Stamp Text */}
        <text
          x="50"
          y="64"
          fill="#dc2626"
          fontSize="7"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          测评认证专用章
        </text>

        {/* Center Micro Status */}
        <text
          x="50"
          y="72"
          fill="#dc2626"
          fontSize="4.6"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="0.4"
        >
          ★ OFFICIAL VERIFIED ★
        </text>

        {/* Curved Bottom Perimeter Text */}
        <path id="seal-curve-bottom" d="M 85,50 A 35,35 0 0,1 15,50" fill="none" />
        <text fill="#dc2626" fontSize="5.3" fontWeight="bold" letterSpacing="0.6">
          <textPath href="#seal-curve-bottom" startOffset="50%" textAnchor="middle">
            HSK 3.0 · CEFR STANDARDS
          </textPath>
        </text>
      </svg>
    </div>
  );
}

/**
 * Institutional Academic Assessment Council Signature Block
 * Eliminates fake names and establishes dignified institutional authorization.
 */
function AcademicSignature() {
  return (
    <div className="flex flex-col items-end text-right">
      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
        Hội Đồng Khảo Thí &amp; Đánh Giá Năng Lực
      </p>
      <p className="text-[7.5px] font-mono text-slate-400">
        CLASSNIA LANGUAGE ASSESSMENT COUNCIL
      </p>

      {/* Official Signatory Stroke Vector */}
      <div className="h-8 flex items-center justify-end my-0.5">
        <svg width="120" height="32" viewBox="0 0 160 40" className="text-slate-800">
          <path
            d="M 14 26 C 30 10, 40 32, 52 14 C 62 28, 74 18, 90 22 C 104 24, 118 12, 134 16 C 142 19, 148 15, 154 17"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 32 32 C 60 34, 98 32, 142 28"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-[10px] font-bold text-slate-900 leading-tight">
        Chủ Tịch Hội Đồng Học Thuật
      </p>
      <p className="text-[8.5px] text-slate-500 font-medium">
        Ban Khảo Thí &amp; Kiểm Định Ngôn Ngữ
      </p>
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
    title: "Khảo thí khẩu ngữ tiếng Trung chuẩn hóa",
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

  // Dynamic verification link pointing to the real report
  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/reports/${testId}`
      : `https://classnia.id.vn/dashboard/reports/${testId}`;

  const printRecommendations = (allRecommendations || []).slice(0, 5);

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 font-sans leading-tight print:p-0 print:max-w-none print:w-full">
      {/* ==================================================================== */}
      {/* PAGE 1: OFFICIAL TEST REPORT FORM & MASTER CERTIFICATE (1-PAGE A4)   */}
      {/* ==================================================================== */}
      {(printMode === "all" || printMode === "certificate") && (
        <div className="relative bg-white border border-slate-400 p-6 print:p-5 overflow-hidden page-break-avoid">
          {/* Elegant Inner Hairline Border */}
          <div className="absolute inset-1.5 border border-slate-200 pointer-events-none" />

          {/* Classical Corner Security Accents */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-slate-800 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-slate-800 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-slate-800 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-slate-800 pointer-events-none" />

          {/* Subtle Watermark Security Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
            <svg width="340" height="340" viewBox="0 0 200 200" className="text-slate-900">
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1" />
              <text x="100" y="115" fontSize="42" fontFamily="serif" fontWeight="bold" textAnchor="middle" fill="currentColor">
                HSK
              </text>
            </svg>
          </div>

          {/* 1. INSTITUTIONAL HEADER */}
          <div className="relative pb-3 mb-3 border-b border-slate-300">
            <div className="flex items-start justify-between gap-3">
              {/* Left: Official Classnia Brand Logo & Institution Title */}
              <div className="flex items-center gap-3">
                <OfficialBrandLogo size={50} />
                <div>
                  <p className="text-[8.5px] font-bold tracking-wider uppercase text-slate-500">
                    TRUNG TÂM KHẢO THÍ TIẾNG TRUNG QUỐC TẾ CLASSNIA &bull; 国际中文水平测评中心
                  </p>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    Phiếu Báo Điểm Khẩu Ngữ Tiếng Trung Chuẩn Hóa
                  </h1>
                  <p className="text-[9.5px] font-bold text-slate-700 uppercase tracking-tight">
                    OFFICIAL CHINESE SPEAKING PROFICIENCY TEST REPORT (HSK 3.0 &bull; CEFR STANDARDS)
                  </p>
                </div>
              </div>

              {/* Right: Security TRF and Genuine Scannable QR Code */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="text-right">
                  <div className="inline-block bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-right">
                    <p className="text-[7.5px] font-mono uppercase text-slate-500 font-bold">MÃ BẢO MẬT TRF</p>
                    <p className="text-[11px] font-mono font-black text-slate-900">#TRF-{shortId}</p>
                  </div>
                  <p className="text-[8.5px] text-slate-500 mt-0.5">Ngày cấp: <strong>{formattedDate}</strong></p>
                  <span className="text-[8px] font-bold text-slate-700 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.2 inline-block mt-0.5">
                    &bull; Bản gốc đã đối soát
                  </span>
                </div>
                <ScannableQrCode value={verificationUrl} size={62} />
              </div>
            </div>
          </div>

          {/* 2. CANDIDATE PROFILE BAR */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 mb-3 text-xs">
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Họ và Tên (Candidate)</span>
              <span className="font-extrabold text-slate-900 text-xs truncate block">{userName}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Mã Hồ Sơ (TRF ID)</span>
              <span className="font-mono font-bold text-slate-800 text-xs truncate block">#TRF-{shortId}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Chủ Đề Khảo Thí (Topic)</span>
              <span className="font-bold text-slate-800 text-xs truncate block">{template.title}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Trình Độ Khảo Thí</span>
              <span className="font-bold text-slate-900 text-xs truncate block">{template.targetLevel} &bull; Khẩu ngữ</span>
            </div>
          </div>

          {/* 3. EXECUTIVE SCORECARD & DIAGNOSTIC RATIONALE (CLEAN ACADEMIC STYLING) */}
          <div className="grid grid-cols-12 gap-2.5 mb-3 items-stretch">
            {/* Scorecard Panel (Subtle & Dignified, no black blocks) */}
            <div className="col-span-4 p-3 rounded-lg bg-white border border-slate-300 flex flex-col justify-between text-center">
              <div>
                <p className="text-[8px] uppercase font-extrabold tracking-wider text-slate-500">
                  TỔNG ĐIỂM KHẨU NGỮ (OVERALL)
                </p>
                <div className="my-1">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {overallScoreVal.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500"> / 100</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-1 text-[10px]">
                <div>
                  <p className="text-[7.5px] uppercase font-bold text-slate-500">Quy Đổi HSK</p>
                  <p className="font-black text-slate-900 text-xs">{hskLabel}</p>
                </div>
                <div>
                  <p className="text-[7.5px] uppercase font-bold text-slate-500">Khung CEFR</p>
                  <p className="font-black text-slate-900 text-xs">{cefrLabel || "CEFR B1"}</p>
                </div>
                <div>
                  <p className="text-[7.5px] uppercase font-bold text-slate-500">Độ Tin Cậy</p>
                  <p className="font-black text-slate-900 text-xs">{confidencePercent}%</p>
                </div>
              </div>
            </div>

            {/* Diagnostic Pedagogical Summary (Clean Academic Box) */}
            <div className="col-span-8 p-3 rounded-lg bg-white border border-slate-300 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[9px] font-extrabold text-slate-800 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
                  <span>Nhận Định Chẩn Đoán Sư Phạm Cốt Lõi</span>
                </div>
                <p className="text-[10px] text-slate-700 leading-relaxed italic line-clamp-3">
                  &ldquo;{summaryText}&rdquo;
                </p>
              </div>

              <div className="pt-1.5 mt-1 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-700 font-extrabold text-[8px] uppercase block">Ưu Điểm Nổi Bật:</span>
                  <p className="text-slate-600 truncate">{strengths?.[0] || "Phản xạ giao tiếp tự nhiên."}</p>
                </div>
                <div>
                  <span className="text-slate-700 font-extrabold text-[8px] uppercase block">Trọng Tâm Hoàn Thiện:</span>
                  <p className="text-slate-600 truncate">{weaknesses?.[0] || "Mở rộng liên từ và cấu trúc phức."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 7-DIMENSION PSYCHOMETRIC RUBRIC TABLE (CLEAN FORMAL TRANSCRIPT) */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[9.5px] font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-3 bg-slate-800 inline-block rounded-xs" />
                Bảng Điểm Chẩn Đoán 7 Chiều Kích Năng Lực (Psychometric Rubric Assessment)
              </h2>
              <span className="text-[8px] text-slate-500 font-medium">Thang đo định lượng chuẩn HSK 3.0</span>
            </div>

            <table className="w-full text-left text-xs border border-slate-300 rounded overflow-hidden border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[9px]">
                  <th className="py-1 px-2 font-bold w-6 text-center">STT</th>
                  <th className="py-1 px-2 font-bold">Kỹ Năng Khảo Thí (Dimension)</th>
                  <th className="py-1 px-2 font-bold w-16 text-center">Điểm Đạt</th>
                  <th className="py-1 px-2 font-bold w-16 text-center">Tỷ Lệ</th>
                  <th className="py-1 px-2 font-bold w-24 text-center">Xếp Loại</th>
                  <th className="py-1 px-2 font-bold">Nhận Định Chuyên Môn Sư Phạm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[10px]">
                {scoreDimensions.map((dim: any, idx: number) => {
                  return (
                    <tr key={dim.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="py-1 px-2 font-bold text-center text-slate-400 text-[9px]">{idx + 1}</td>
                      <td className="py-1 px-2 font-bold text-slate-900">
                        {dim.dimensionName}
                      </td>
                      <td className="py-1 px-2 text-center font-bold text-slate-900 text-[10px]">
                        {typeof dim.score === "number" ? dim.score.toFixed(1) : dim.score} / {dim.maxScore || 20}
                      </td>
                      <td className="py-1 px-2 text-center font-semibold text-slate-700 text-[9.5px]">
                        {dim.percent}%
                      </td>
                      <td className="py-1 px-2 text-center">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                          {dim.performanceLevel || (dim.percent >= 70 ? "Thành thạo" : dim.percent >= 50 ? "Đạt chuẩn" : "Rèn luyện")}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-slate-600 text-[9.5px] leading-tight">
                        {dim.rationale}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. OFFICIAL DIGITAL SEAL & SIGNATURE BLOCK */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between gap-3 text-xs">
            {/* Left: Security verification notice */}
            <div className="space-y-0.5 max-w-xs">
              <p className="text-[8px] text-slate-500 leading-tight">
                Phiếu điểm được xác thực và đối soát bởi Hệ thống Khảo thí Ngôn ngữ Classnia AI theo Khung Chuẩn HSK 3.0 &amp; CEFR Quốc tế.
              </p>
              <p className="text-[8px] font-mono text-slate-600 truncate">
                Xác thực: <span className="underline">{verificationUrl}</span>
              </p>
              <p className="text-[7px] font-mono text-slate-400">
                HASH: {shortId}-{Math.abs(overallScoreVal * 7919).toString(16).toUpperCase()} &bull; OFFICIAL DOCUMENT
              </p>
            </div>

            {/* Right: Red Institutional Seal & Academic Council Signature */}
            <div className="flex items-center gap-3 shrink-0">
              <OfficialChineseRedSeal />
              <AcademicSignature />
            </div>
          </div>

          {/* Page 1 Bottom Metadata */}
          <div className="pt-1.5 mt-1 border-t border-slate-200 flex items-center justify-between text-[7.5px] text-slate-400 font-mono">
            <span>BẢN BÁO ĐIỂM KHẢO THÍ CHÍNH THỨC &bull; CLASSNIA AI ASSESSMENT PLATFORM</span>
            <span>{printMode === "all" ? "TRANG 1 / 2" : "TRANG 1 / 1"}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PAGE 2: DIAGNOSTIC LINGUISTIC ANALYSIS & ACTIONABLE ROADMAP          */}
      {/* ==================================================================== */}
      {(printMode === "all" || printMode === "diagnostics") && (
        <div
          className={`relative bg-white border border-slate-400 p-6 print:p-5 overflow-hidden ${
            printMode === "all" ? "page-break-before mt-8 print:mt-0" : ""
          }`}
        >
          <div className="absolute inset-1.5 border border-slate-200 pointer-events-none" />
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-slate-800 pointer-events-none" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-slate-800 pointer-events-none" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-slate-800 pointer-events-none" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-slate-800 pointer-events-none" />

          {/* Page 2 Header */}
          <div className="relative pb-2.5 mb-3 border-b border-slate-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <OfficialBrandLogo size={38} />
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight">
                  Phụ Lục Chẩn Đoán Lỗi &amp; Lộ Trình Nâng Cao Năng Lực
                </h2>
                <p className="text-[8.5px] text-slate-500 font-medium">
                  DIAGNOSTIC ERROR ANALYSIS &amp; ACTIONABLE PEDAGOGICAL ROADMAP &bull; HSK 3.0
                </p>
              </div>
            </div>
            <div className="text-right text-[9px] text-slate-600 shrink-0">
              <p>Thí sinh: <strong>{userName}</strong></p>
              <p className="font-mono text-[8px] text-slate-400">#TRF-{shortId}</p>
            </div>
          </div>

          {/* Section 1: Strengths & Weaknesses 2-Column Matrix */}
          <div className="grid grid-cols-2 gap-2.5 mb-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
                Ưu Điểm Đã Xác Thực (Linguistic Strengths)
              </h3>
              <ul className="space-y-1 text-[10px] text-slate-700">
                {(strengths || []).slice(0, 3).map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-slate-500 font-bold shrink-0">&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <h3 className="text-[9px] font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />
                Trọng Tâm Cần Hoàn Thiện (Priority Focus)
              </h3>
              <ul className="space-y-1 text-[10px] text-slate-700">
                {(weaknesses || []).slice(0, 3).map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-slate-500 font-bold shrink-0">&bull;</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2: Detailed Linguistic Corrections Table */}
          {printRecommendations.length > 0 && (
            <div className="mb-3">
              <h3 className="text-[9.5px] font-black uppercase text-slate-900 mb-1 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-3 bg-slate-800 inline-block rounded-xs" />
                Dẫn Chứng Sửa Lỗi Ngữ Âm &amp; Diễn Đạt Điển Hình (Targeted Linguistic Corrections)
              </h3>
              <table className="w-full text-left text-xs border border-slate-300 rounded overflow-hidden border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[9px]">
                    <th className="py-1 px-2 font-bold w-1/3">Phát Ngôn Gốc Của Thí Sinh</th>
                    <th className="py-1 px-2 font-bold w-1/3 text-slate-900">Gợi Ý Diễn Đạt Chuẩn Bản Xứ</th>
                    <th className="py-1 px-2 font-bold">Phân Tích &amp; Hướng Dẫn Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10px]">
                  {printRecommendations.map((rec: any, idx: number) => (
                    <tr key={rec.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="py-1 px-2 font-mono text-slate-700 text-[9.5px]">
                        {rec.originalPhrase ? `"${rec.originalPhrase}"` : "—"}
                      </td>
                      <td className="py-1 px-2 font-bold text-slate-900">
                        {rec.correctedPhrase ? `"${rec.correctedPhrase}"` : "—"}
                      </td>
                      <td className="py-1 px-2 text-slate-600 text-[9.5px] leading-tight">
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
              <h3 className="text-[9.5px] font-black uppercase text-slate-900 mb-1.5 tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-3 bg-slate-800 inline-block rounded-xs" />
                Kế Hoạch &amp; Lộ Trình 4 Tuần Nâng Cấp Năng Lực (4-Week Action Plan)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {improvementPlan.slice(0, 4).map((plan: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 inline-block mb-1">
                        Tuần {plan.week || idx + 1}
                      </span>
                      <p className="font-bold text-slate-900 text-[9.5px] leading-tight mb-1">{plan.title}</p>
                      <p className="text-[8.5px] text-slate-600 leading-snug line-clamp-3">{plan.focus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page 2 Footer */}
          <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[7.5px] text-slate-400 font-mono">
            <span>CLASSNIA AI ASSESSMENT PLATFORM &bull; HSK 3.0 COMPLIANT</span>
            <span>{printMode === "all" ? "TRANG 2 / 2" : "TRANG 1 / 1"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
