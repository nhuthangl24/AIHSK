"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  X,
  Volume2,
  Bot,
  User,
  Trash2,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { StoredSession } from "@/lib/db/assessment-store";

interface SessionsClientProps {
  initialSessions: StoredSession[];
}

export function SessionsClient({ initialSessions }: SessionsClientProps) {
  const [sessions, setSessions] = useState<StoredSession[]>(initialSessions);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSession, setSelectedSession] = useState<StoredSession | null>(null);
  const [activeTab, setActiveTab] = useState<"SCORE" | "TRANSCRIPT">("SCORE");
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "COMPLETED");
    const totalScore = completed.reduce((sum, s) => sum + (s.result?.overallScore || 0), 0);
    const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
    const passed = completed.filter((s) => s.result?.passingStatus !== false).length;

    return {
      total: sessions.length,
      completed: completed.length,
      inProgress: sessions.filter((s) => s.status === "IN_PROGRESS").length,
      avgScore,
      passRate: completed.length > 0 ? Math.round((passed / completed.length) * 100) : 100,
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      const lvl = s.template?.targetLevel || s.result?.hskLevel || "";
      const matchLevel = levelFilter === "ALL" || lvl === levelFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        (s.userEmail && s.userEmail.toLowerCase().includes(q)) ||
        (s.userId && s.userId.toLowerCase().includes(q)) ||
        (s.template?.title && s.template.title.toLowerCase().includes(q));

      return matchStatus && matchLevel && matchSearch;
    });
  }, [sessions, statusFilter, levelFilter, search]);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phiên khảo thí #${sessionId} này không?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/sessions?id=${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (selectedSession?.id === sessionId) setSelectedSession(null);
      } else {
        alert("Xóa thất bại!");
      }
    } catch {
      alert("Đã có lỗi xảy ra!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-rose-600 text-xs">
              Khảo Thí & Đánh Giá
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Phiên Thi & Kết Quả Khảo Thí
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tất cả lượt thi của học viên, đánh giá 7 chiều kích tâm trắc học và lịch sử đối thoại 5 giai đoạn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const res = await fetch("/api/admin/sessions");
              const d = await res.json();
              if (d.sessions) setSessions(d.sessions);
            }}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Tổng Phiên Thi</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
            <p className="text-[11px] text-slate-400">Đã khởi tạo</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="p-4">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Hoàn Thành Đầy Đủ</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</div>
            <p className="text-[11px] text-emerald-500">Đã xuất báo cáo</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10">
          <CardContent className="p-4">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Điểm TB Hệ Thống</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.avgScore} / 100</div>
            <p className="text-[11px] text-blue-500">Toàn bộ thí sinh</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/10">
          <CardContent className="p-4">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">Tỷ Lệ Đạt (Pass)</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.passRate}%</div>
            <p className="text-[11px] text-purple-500">Chuẩn đầu ra HSKK</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo email thí sinh, mã phòng thi, tên đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">Mọi cấp độ HSK</option>
            <option value="HSK 1">HSK 1 (Sơ cấp 1)</option>
            <option value="HSK 2">HSK 2 (Sơ cấp 2)</option>
            <option value="HSK 3">HSK 3 (Trung cấp 1)</option>
            <option value="HSK 4">HSK 4 (Trung cấp 2)</option>
            <option value="HSK 5">HSK 5 (Cao cấp 1)</option>
            <option value="HSK 6">HSK 6 (Cao cấp 2)</option>
          </select>

          {/* Status Filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            {["ALL", "COMPLETED", "IN_PROGRESS", "FAILED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === s
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {s === "ALL" ? "Tất cả" : s === "COMPLETED" ? "Đã xong" : s === "IN_PROGRESS" ? "Đang thi" : "Lỗi"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table of Sessions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/70 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Phiên Thi</th>
                <th className="py-3 px-4">Học Viên</th>
                <th className="py-3 px-4">Mẫu Đề / Cấp Độ</th>
                <th className="py-3 px-4">Tiến Độ</th>
                <th className="py-3 px-4">Điểm Tổng</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSessions.map((session) => {
                const targetLvl = session.template?.targetLevel || session.result?.hskLevel || "HSK 3";
                const isCompleted = session.status === "COMPLETED";
                const score = session.result?.overallScore;

                return (
                  <tr
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      setActiveTab("SCORE");
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      {session.id.substring(0, 10)}...
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {session.userEmail || session.userId}
                      </span>
                      <span className="text-slate-400 text-[10px]">ID: {session.userId.substring(0, 12)}...</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="cinnabar" className="text-[10px] px-1.5 py-0 font-bold">
                          {targetLvl}
                        </Badge>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                          {session.template?.title || "Bài Thi Chuẩn HSKK"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      Chặng {session.currentStage}/5 &bull; {session.turns?.length || session.currentTurn || 0} lượt
                    </td>

                    <td className="py-3 px-4">
                      {isCompleted && typeof score === "number" ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-black ${score >= 60 ? "text-emerald-600" : "text-rose-600"}`}>
                            {score}
                          </span>
                          <span className="text-[10px] text-slate-400">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Chưa chấm</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Hoàn tất
                        </span>
                      ) : session.status === "IN_PROGRESS" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse">
                          Đang thi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          {session.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {session.createdAt || session.startedAt
                        ? formatDate(session.createdAt || session.startedAt!)
                        : "-"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                          setActiveTab("SCORE");
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      >
                        Xem bài
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Award className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-medium">Không tìm thấy bài thi nào</p>
                    <p className="text-xs text-slate-500 mt-0.5">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                    {selectedSession.id}
                  </span>
                  <Badge variant="cinnabar" className="text-[10px]">
                    {selectedSession.template?.targetLevel || selectedSession.result?.hskLevel || "HSK"}
                  </Badge>
                  {selectedSession.result?.overallScore !== undefined && (
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Điểm: {selectedSession.result.overallScore}/100
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {selectedSession.template?.title || "Bài Khảo Thí Khẩu Ngữ Tiếng Trung"}
                </h3>
                <p className="text-xs text-slate-500">
                  Thí sinh: <strong>{selectedSession.userEmail || selectedSession.userId}</strong> &bull; Bắt đầu: {formatDate(selectedSession.startedAt || selectedSession.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Sub-nav Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("SCORE")}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "SCORE"
                    ? "border-rose-600 text-rose-600 dark:text-rose-400 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Báo Cáo & 7 Chiều Kích Chấm</span>
              </button>
              <button
                onClick={() => setActiveTab("TRANSCRIPT")}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "TRANSCRIPT"
                    ? "border-rose-600 text-rose-600 dark:text-rose-400 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                <span>Biên Bản Hội Thoại 5 Chặng ({selectedSession.turns?.length || 0})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
              {activeTab === "SCORE" && (
                <div className="space-y-4">
                  {selectedSession.result ? (
                    <>
                      {/* Overall Rationale */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Nhận xét từ Giám Khảo AI:
                          </span>
                          <span className="text-[11px] text-slate-500">
                            HSK Estimate: <strong>{selectedSession.result.hskEstimate || selectedSession.result.hskLevel}</strong>
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                          {selectedSession.result.feedbackSummary || selectedSession.result.scoringRationale || "Đã hoàn thành tốt các chặng khảo thí khẩu ngữ."}
                        </p>
                      </div>

                      {/* 7 Psychometric Dimensions */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          Đánh Giá 7 Chiều Kích Tâm Trắc Học:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {selectedSession.result.scoreDimensions?.map((dim, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  {dim.dimensionName}
                                </span>
                                <span className="font-black text-xs text-rose-600 dark:text-rose-400">
                                  {dim.score}/{dim.maxScore || 10}
                                </span>
                              </div>
                              {dim.feedback && (
                                <p className="text-[11px] text-slate-500 leading-normal">
                                  {dim.feedback}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center text-slate-400">
                      <AlertCircle className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <p className="font-medium text-sm">Phiên thi chưa hoàn tất hoặc chưa chấm điểm</p>
                      <p className="text-xs text-slate-500">Trạng thái hiện tại: {selectedSession.status}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "TRANSCRIPT" && (
                <div className="space-y-3">
                  {selectedSession.turns && selectedSession.turns.length > 0 ? (
                    selectedSession.turns.map((turn, i) => {
                      const isExaminer = turn.speaker === "EXAMINER";
                      return (
                        <div
                          key={i}
                          className={`flex gap-3 p-3.5 rounded-2xl border text-xs ${
                            isExaminer
                              ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80"
                              : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50"
                          }`}
                        >
                          <div
                            className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isExaminer ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" : "bg-rose-600 text-white"
                            }`}
                          >
                            {isExaminer ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {isExaminer ? "Giám khảo AI" : "Học viên"} &bull; Lượt #{turn.turnIndex + 1} (Chặng {turn.stage})
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {turn.createdAt ? formatDate(turn.createdAt) : ""}
                              </span>
                            </div>

                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {turn.textContent}
                            </p>

                            {turn.pinyinContent && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {turn.pinyinContent}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-slate-400">
                      <p className="text-sm">Chưa có lượt đối thoại nào được ghi nhận cho phiên thi này.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/dashboard/reports?session=${selectedSession.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:underline"
              >
                <span>Xem giao diện báo cáo học viên</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => handleDeleteSession(selectedSession.id)}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span>Xóa Phiên</span>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedSession(null)}
                  className="text-xs"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
