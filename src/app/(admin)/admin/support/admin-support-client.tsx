"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Bug,
  Sparkles,
  Lightbulb,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Laptop,
  Check,
  Save,
  Loader2,
  X,
  Send,
  Flame,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoredSupportTicket } from "@/lib/db/assessment-store";
import { cn } from "@/lib/utils";

interface AdminSupportClientProps {
  initialTickets: StoredSupportTicket[];
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  BUG: {
    label: "Báo Lỗi Kỹ Thuật",
    icon: Bug,
    color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
  AI_FEEDBACK: {
    label: "Góp Ý Giám Khảo AI",
    icon: Sparkles,
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  FEATURE: {
    label: "Đề Xuất Tính Năng",
    icon: Lightbulb,
    color: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  ACCOUNT: {
    label: "Tài Khoản / Dữ Liệu",
    icon: UserCheck,
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  OTHER: {
    label: "Thắc Mắc Khác",
    icon: MessageSquare,
    color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
};

const CANNED_RESPONSES = [
  "Đội ngũ kỹ thuật Classnia đã tiếp nhận và đang trích xuất log phòng thi để phân tích sự cố.",
  "Đã kiểm tra và tinh chỉnh lại luồng âm thanh micro / TTS, mời bạn vào phòng thi kiểm tra lại.",
  "Cảm ơn bạn đã góp ý quý báu! Ban sư phạm đã cập nhật prompt Giám khảo AI để phản hồi tự nhiên hơn.",
  "Sự cố đã được xử lý hoàn tất. Chúc bạn có những buổi luyện thi khẩu ngữ đạt kết quả cao!",
];

export default function AdminSupportClient({ initialTickets, user }: AdminSupportClientProps) {
  const [tickets, setTickets] = useState<StoredSupportTicket[]>(initialTickets || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<StoredSupportTicket | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form edit states for selected ticket
  const [editStatus, setEditStatus] = useState<"OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED">("OPEN");
  const [editPriority, setEditPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [editResponse, setEditResponse] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fetchFreshTickets = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/support?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      const d = await res.json();
      if (d.tickets && Array.isArray(d.tickets)) {
        setTickets(d.tickets);
      }
    } catch {
      // Silently fail — keep showing current state
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Fetch fresh on mount (bypass SSR cache)
    fetchFreshTickets();

    // Real-time cross-tab: listen for learner ticket creation
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("classnia_support_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "TICKET_CREATED" && event.data?.ticket) {
          const newTicket: StoredSupportTicket = event.data.ticket;
          setTickets((prev) => {
            if (prev.some((t) => t.id === newTicket.id)) return prev;
            return [newTicket, ...prev];
          });
        }
      };
    }

    // Auto-poll every 15 seconds so admin sees new learner tickets without refreshing
    const poll = setInterval(fetchFreshTickets, 15000);

    return () => {
      clearInterval(poll);
      if (bc) bc.close();
    };
  }, [fetchFreshTickets]);

  const openTicketDetail = (ticket: StoredSupportTicket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status || "OPEN");
    setEditPriority(ticket.priority || "MEDIUM");
    setEditResponse(ticket.adminResponse || "");
    setFeedbackSuccess(null);
    setFeedbackError(null);
  };

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setIsSaving(true);
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: editStatus,
          priority: editPriority,
          adminResponse: editResponse,
          fallbackTicket: { ...selectedTicket, status: editStatus, adminResponse: editResponse, updatedAt: new Date().toISOString() },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể cập nhật yêu cầu.");
      }

      const updatedTicket: StoredSupportTicket = data.ticket || {
        ...selectedTicket,
        status: editStatus,
        adminResponse: editResponse.trim() || selectedTicket.adminResponse || null,
        updatedAt: new Date().toISOString(),
      };

      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
      setSelectedTicket(updatedTicket);

      // Broadcast update to learner tab so they see response without refreshing
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("classnia_support_sync");
          bc.postMessage({ type: "TICKET_UPDATED", ticket: updatedTicket });
          bc.close();
        } catch {}
      }

      setFeedbackSuccess("Đã lưu cập nhật và gửi phản hồi tới học viên thành công!");
    } catch (err: any) {
      setFeedbackError(err.message || "Đã xảy ra sự cố khi lưu cập nhật.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    if (statusFilter === "OPEN" && t.status !== "OPEN") return false;
    if (statusFilter === "IN_PROGRESS" && t.status !== "IN_PROGRESS") return false;
    if (statusFilter === "RESOLVED" && t.status !== "RESOLVED" && t.status !== "CLOSED") return false;
    if (statusFilter === "URGENT" && t.priority !== "URGENT") return false;

    // Category filter
    if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchId = t.id.toLowerCase().includes(query);
      const matchUser = (t.userName || "").toLowerCase().includes(query);
      const matchEmail = (t.userEmail || "").toLowerCase().includes(query);
      const matchTitle = (t.title || "").toLowerCase().includes(query);
      const matchDesc = (t.description || "").toLowerCase().includes(query);
      const matchSession = (t.relatedSessionId || "").toLowerCase().includes(query);
      return matchId || matchUser || matchEmail || matchTitle || matchDesc || matchSession;
    }

    return true;
  });

  // KPI calculations
  const totalCount = tickets.length;
  const urgentCount = tickets.filter(
    (t) => t.priority === "URGENT" && t.status !== "RESOLVED" && t.status !== "CLOSED"
  ).length;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 text-xs font-bold uppercase tracking-wider">
              Trung Tâm Quản Trị
            </Badge>
            <span className="text-xs font-semibold text-slate-400">Support & Ticket Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Quản Lý Yêu Cầu & Báo Lỗi Học Viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Theo dõi, xử lý sự cố phòng thi và phản hồi trực tiếp các góp ý chất lượng Giám khảo AI từ người học.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchFreshTickets}
            title="Tải lại danh sách mới nhất"
            className="p-2 rounded-xl text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="text-xs rounded-xl h-9">
              &larr; Về Tổng Quan Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Tổng Số Yêu Cầu</span>
              <HelpCircle className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
            <p className="text-[10px] text-slate-400">Toàn bộ ticket từ Beta Test</p>
          </CardContent>
        </Card>

        {/* Urgent */}
        <Card className="border-rose-200/90 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold">
              <span>Khẩn Cấp / Phòng Thi</span>
              <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-rose-600">{urgentCount}</p>
            <p className="text-[10px] text-rose-700/80">Cần xử lý ngay lập tức</p>
          </CardContent>
        </Card>

        {/* Open / In-Progress */}
        <Card className="border-amber-200/90 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-bold">
              <span>Chờ & Đang Xử Lý</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-600">{openCount + inProgressCount}</p>
            <p className="text-[10px] text-amber-700/80">
              {openCount} mới tiếp nhận &bull; {inProgressCount} đang xử lý
            </p>
          </CardContent>
        </Card>

        {/* Resolved */}
        <Card className="border-emerald-200/90 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-2xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span>Đã Giải Quyết</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
            <p className="text-[10px] text-emerald-700/80">Đã phản hồi cho học viên</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã #TK-, tên, email học viên hoặc mã phòng thi..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
            {[
              { id: "ALL", label: `Tất cả (${totalCount})` },
              { id: "OPEN", label: `Mới (${openCount})` },
              { id: "IN_PROGRESS", label: `Đang xử lý (${inProgressCount})` },
              { id: "URGENT", label: `Khẩn cấp (${urgentCount})` },
              { id: "RESOLVED", label: `Đã xong (${resolvedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all",
                  statusFilter === tab.id
                    ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">Mọi danh mục</option>
            <option value="BUG">Báo Lỗi Kỹ Thuật (BUG)</option>
            <option value="AI_FEEDBACK">Góp Ý Giám Khảo AI</option>
            <option value="FEATURE">Đề Xuất Tính Năng</option>
            <option value="ACCOUNT">Tài Khoản / Dữ Liệu</option>
            <option value="OTHER">Thắc Mắc Khác</option>
          </select>
        </div>
      </Card>

      {/* Tickets List Table */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Danh Sách Yêu Cầu ({filteredTickets.length})
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-400">
                &bull; Kết quả lọc theo &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Không tìm thấy yêu cầu hỗ trợ nào
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không có ticket nào khớp với bộ lọc hiện tại. Khi học viên gửi phản hồi, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold text-[11px]">
                  <th className="py-3 px-4 w-28">Mã Ticket</th>
                  <th className="py-3 px-4">Học Viên (Thí Sinh)</th>
                  <th className="py-3 px-4">Phân Loại & Mức Độ</th>
                  <th className="py-3 px-4">Nội Dung Yêu Cầu</th>
                  <th className="py-3 px-4 w-28 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 w-28 text-right">Thời Gian</th>
                  <th className="py-3 px-4 w-24 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((ticket) => {
                  const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.OTHER;
                  const isUrgent = ticket.priority === "URGENT";
                  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

                  return (
                    <tr
                      key={ticket.id}
                      className={cn(
                        "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors",
                        isUrgent && !isResolved && "bg-rose-50/20 dark:bg-rose-950/10"
                      )}
                    >
                      {/* Ticket Code */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        #{ticket.id}
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {ticket.userName || "Học Viên"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{ticket.userEmail}</p>
                        </div>
                      </td>

                      {/* Category & Priority */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-bold px-2 py-0.5", cat.color)}
                          >
                            {cat.label}
                          </Badge>
                          <div>
                            {isUrgent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 animate-pulse">
                                <Flame className="h-3 w-3" />
                                Khẩn cấp
                              </span>
                            ) : ticket.priority === "HIGH" ? (
                              <span className="text-[10px] font-bold text-amber-600">Cần gấp</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Bình thường</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Content preview */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {ticket.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {ticket.description}
                        </p>
                        {ticket.relatedSessionId && (
                          <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400">
                            Phòng thi: {ticket.relatedSessionId.substring(0, 16)}...
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5",
                            isResolved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300"
                              : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                          )}
                        >
                          {isResolved
                            ? "Đã giải quyết"
                            : ticket.status === "IN_PROGRESS"
                            ? "Đang xử lý"
                            : "Mới tiếp nhận"}
                        </Badge>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-right text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => openTicketDetail(ticket)}
                          className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs h-7 px-2.5 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          Xử Lý
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ticket Detail & Admin Response Drawer/Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                    #{selectedTicket.id}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5",
                      (CATEGORY_MAP[selectedTicket.category] || CATEGORY_MAP.OTHER).color
                    )}
                  >
                    {(CATEGORY_MAP[selectedTicket.category] || CATEGORY_MAP.OTHER).label}
                  </Badge>
                  {selectedTicket.priority === "URGENT" && (
                    <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0">
                      Khẩn cấp
                    </Badge>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Người gửi: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail}) &bull;{" "}
                  {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description Verbatim */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nội dung mô tả của học viên:
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Related Session Link */}
            {selectedTicket.relatedSessionId && (
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-purple-900 dark:text-purple-300 block">
                    Phòng thi liên quan:
                  </span>
                  <span className="font-mono text-purple-700 dark:text-purple-400">
                    {selectedTicket.relatedSessionId}
                  </span>
                </div>
                <Link
                  href={`/dashboard/reports/${selectedTicket.relatedSessionId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300"
                >
                  <span>Xem Báo Cáo</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Technical Diagnostics */}
            {selectedTicket.deviceInfo && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-slate-400" />
                  Chẩn đoán thiết bị người dùng:
                </span>
                <p className="font-mono text-[11px] text-slate-500 break-all leading-tight">
                  {selectedTicket.deviceInfo}
                </p>
              </div>
            )}

            {/* Admin Response & Action Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <span>Cập Nhật Tiến Độ & Phản Hồi Cho Học Viên</span>
              </h4>

              {/* Status and Priority selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Trạng thái xử lý:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="OPEN">🟡 Mới tiếp nhận (OPEN)</option>
                    <option value="IN_PROGRESS">🔵 Đang xử lý (IN_PROGRESS)</option>
                    <option value="RESOLVED">🟢 Đã giải quyết (RESOLVED)</option>
                    <option value="CLOSED">⚪ Đã đóng ticket (CLOSED)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mức độ ưu tiên:
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="LOW">Bình thường (LOW)</option>
                    <option value="MEDIUM">Cần chú ý (MEDIUM)</option>
                    <option value="HIGH">Cần gấp (HIGH)</option>
                    <option value="URGENT">🔴 Khẩn cấp trong phòng thi (URGENT)</option>
                  </select>
                </div>
              </div>

              {/* Quick Canned Responses */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phản hồi mẫu nhanh (Bấm để chèn):
                </label>
                <div className="space-y-1">
                  {CANNED_RESPONSES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditResponse(tmpl)}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-800 line-clamp-1"
                    >
                      &bull; {tmpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea for Response */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lời nhắn / Phản hồi của Kỹ thuật viên (Hiển thị cho học viên):
                </label>
                <textarea
                  rows={3}
                  value={editResponse}
                  onChange={(e) => setEditResponse(e.target.value)}
                  placeholder="Nhập thông điệp giải đáp hoặc hướng dẫn người học tại đây..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Feedback Alert */}
              {feedbackSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}
              {feedbackError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{feedbackError}</span>
                </div>
              )}

              {/* Save CTA */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTicket(null)}
                  className="text-xs"
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveTicket}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl px-4 gap-1.5 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Lưu & Gửi Phản Hồi</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
