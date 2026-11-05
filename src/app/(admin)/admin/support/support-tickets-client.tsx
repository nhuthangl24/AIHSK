"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  AlertTriangle,
  Sparkles,
  Bug,
  HelpCircle,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ExternalLink,
  MessageSquare,
  Check,
  RefreshCw,
  Send,
  X,
  Laptop,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { StoredSupportTicket } from "@/lib/db/assessment-store";

interface SupportTicketsClientProps {
  initialTickets: StoredSupportTicket[];
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string }> = {
  BUG: { label: "Báo Lỗi / Sự Cố", icon: Bug, color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400" },
  AI_FEEDBACK: { label: "Góp Ý Giám Khảo AI", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-400" },
  FEATURE: { label: "Đề Xuất Tính Năng", icon: HelpCircle, color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-400" },
  ACCOUNT: { label: "Tài Khoản & Dữ Liệu", icon: UserCheck, color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400" },
  OTHER: { label: "Khác", icon: MessageSquare, color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" },
};

const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  URGENT: { label: "Khẩn cấp", color: "bg-red-500 text-white" },
  HIGH: { label: "Mức cao", color: "bg-orange-500 text-white" },
  MEDIUM: { label: "Bình thường", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  LOW: { label: "Thấp", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  OPEN: { label: "Mới gửi", badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200" },
  IN_PROGRESS: { label: "Đang xử lý", badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200" },
  RESOLVED: { label: "Đã giải quyết", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200" },
  CLOSED: { label: "Đã đóng", badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200" },
};

const LOCAL_STORAGE_ADMIN_TICKETS_KEY = "classnia_admin_support_tickets_v2";

function isClientTestTicket(t: StoredSupportTicket | null | undefined): boolean {
  if (!t || !t.id) return true;
  const id = t.id.toUpperCase();
  if (
    id.startsWith("TK-TEST-") ||
    id.startsWith("TK-UPDATE-") ||
    id.startsWith("TK-ADM-") ||
    id.startsWith("TK-BULK-") ||
    id.startsWith("TK-SYNTH-") ||
    id.startsWith("TK-DEBUG-") ||
    id.startsWith("TK-HSKK-")
  ) {
    return true;
  }
  const email = (t.userEmail || "").toLowerCase();
  if (
    email.endsWith("@example.com") ||
    email.endsWith("@test.com") ||
    email.endsWith("@purge.org") ||
    (email.includes("classnia.id.vn") && (email.startsWith("ha.") || email.startsWith("bao.") || email.startsWith("quynhanh.") || email.startsWith("huy.")))
  ) {
    return true;
  }
  return false;
}

function mergeTickets(
  sourceA: StoredSupportTicket[],
  sourceB: StoredSupportTicket[]
): StoredSupportTicket[] {
  const map = new Map<string, StoredSupportTicket>();
  for (const t of sourceA) {
    if (t?.id && !isClientTestTicket(t)) map.set(t.id, t);
  }
  for (const t of sourceB) {
    if (!t?.id || isClientTestTicket(t)) continue;
    const existing = map.get(t.id);
    if (!existing || new Date(t.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
      map.set(t.id, t);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function SupportTicketsClient({ initialTickets }: SupportTicketsClientProps) {
  const [tickets, setTickets] = useState<StoredSupportTicket[]>(() =>
    (initialTickets || []).filter((t) => !isClientTestTicket(t))
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<StoredSupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    };
  }, [tickets]);

  const fetchFreshTickets = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/support?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      const d = await res.json();
      if (d.tickets && Array.isArray(d.tickets)) {
        const cleanTickets = d.tickets.filter((t: StoredSupportTicket) => !isClientTestTicket(t));
        setTickets(cleanTickets);
        try {
          localStorage.setItem(LOCAL_STORAGE_ADMIN_TICKETS_KEY, JSON.stringify(cleanTickets));
        } catch {}
      }
    } catch {
      // Fallback silently if offline
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Wipe old legacy dirty cache
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("classnia_admin_support_tickets");
      } catch {}
    }

    // 2. Fetch fresh tickets from server
    fetchFreshTickets();

    // 3. Real-time cross-tab broadcast synchronization
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("classnia_support_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "TICKET_CREATED" && event.data?.ticket) {
          const newTicket: StoredSupportTicket = event.data.ticket;
          if (!isClientTestTicket(newTicket)) {
            setTickets((prev) => mergeTickets(prev, [newTicket]));
          }
        } else if (event.data?.type === "TICKET_UPDATED" && event.data?.ticket) {
          const updated: StoredSupportTicket = event.data.ticket;
          if (!isClientTestTicket(updated)) {
            setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }
        }
      };
    }

    // 5. Auto-poll every 15 seconds to safely check for incoming learner tickets
    const poll = setInterval(fetchFreshTickets, 15000);

    return () => {
      clearInterval(poll);
      if (bc) bc.close();
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchCategory = categoryFilter === "ALL" || t.category === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        (t.relatedSessionId && t.relatedSessionId.toLowerCase().includes(q));

      return matchStatus && matchCategory && matchSearch;
    });
  }, [tickets, statusFilter, categoryFilter, search]);

  const handleOpenTicket = (ticket: StoredSupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminResponse || "");
    setActionSuccess(null);
  };

  const handleUpdateTicket = async (newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") => {
    if (!selectedTicket) return;
    setIsUpdating(true);
    setActionSuccess(null);

    const nowIso = new Date().toISOString();
    const updatedTicket: StoredSupportTicket = {
      ...selectedTicket,
      status: newStatus,
      adminResponse: replyText.trim() || selectedTicket.adminResponse || null,
      updatedAt: nowIso,
    };

    // 1. Optimistic update to UI state and localStorage
    setTickets((prev) => {
      const next = prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t));
      try {
        localStorage.setItem(LOCAL_STORAGE_ADMIN_TICKETS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedTicket(updatedTicket);

    // 2. Prevent disappearing: if currently filtering by OPEN and moving to RESOLVED, switch to ALL view
    if (statusFilter !== "ALL" && statusFilter !== newStatus) {
      setStatusFilter("ALL");
    }

    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: newStatus,
          adminResponse: replyText.trim(),
          fallbackTicket: updatedTicket,
        }),
      });

      const data = await res.json();
      const serverUpdated: StoredSupportTicket = data.ticket || updatedTicket;

      setTickets((prev) => {
        const next = prev.map((t) => (t.id === selectedTicket.id ? serverUpdated : t));
        try {
          localStorage.setItem(LOCAL_STORAGE_ADMIN_TICKETS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      setSelectedTicket(serverUpdated);

      // Broadcast update across tabs
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("classnia_support_sync");
          bc.postMessage({ type: "TICKET_UPDATED", ticket: serverUpdated });
          bc.close();
        } catch {}
      }

      setActionSuccess(
        `Đã cập nhật trạng thái thành công: "${STATUS_MAP[newStatus].label}"! Phản hồi đã được chuyển tới học viên.`
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } catch {
      setActionSuccess(
        `Đã lưu cập nhật nội bộ: "${STATUS_MAP[newStatus].label}".`
      );
      setTimeout(() => setActionSuccess(null), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-purple-600 text-xs">
              CSKH & Kỹ Thuật
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Yêu Cầu & Báo Lỗi Học Viên
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận, xử lý sự cố thiết bị micro/mạng, phản hồi giám khảo AI và giải đáp thắc mắc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={fetchFreshTickets}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-purple-600" : ""}`} />
            <span>{isRefreshing ? "Đang đồng bộ..." : "Làm mới"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats (Clickable Interactive Quick Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "ALL"
              ? "border-purple-500 ring-2 ring-purple-500/20 shadow-sm"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <CardContent className="p-4">
            <span className="text-xs text-slate-500 font-medium">Tổng Yêu Cầu</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
            <p className="text-[11px] text-slate-400">Tất cả đơn &bull; Bấm để xem</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("OPEN")}
          className={`cursor-pointer transition-all hover:shadow-md border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10 ${
            statusFilter === "OPEN"
              ? "border-rose-500 ring-2 ring-rose-500/30 shadow-sm"
              : "hover:border-rose-300"
          }`}
        >
          <CardContent className="p-4">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">Chờ Xử Lý (Mới)</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.open}</div>
            <p className="text-[11px] text-rose-500">Cần phản hồi sớm &bull; Bấm để lọc</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`cursor-pointer transition-all hover:shadow-md border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10 ${
            statusFilter === "IN_PROGRESS"
              ? "border-blue-500 ring-2 ring-blue-500/30 shadow-sm"
              : "hover:border-blue-300"
          }`}
        >
          <CardContent className="p-4">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Đang Xử Lý</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.inProgress}</div>
            <p className="text-[11px] text-blue-500">Kỹ thuật đang kiểm tra &bull; Bấm để lọc</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter("RESOLVED")}
          className={`cursor-pointer transition-all hover:shadow-md border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 ${
            statusFilter === "RESOLVED"
              ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm"
              : "hover:border-emerald-300"
          }`}
        >
          <CardContent className="p-4">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Đã Giải Quyết</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved}</div>
            <p className="text-[11px] text-emerald-500">Đã xong phản hồi &bull; Bấm để lọc</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã ticket, tên, email, phòng thi, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs flex-wrap">
            {[
              { id: "ALL", label: "Tất cả", count: stats.total },
              { id: "OPEN", label: "Mới gửi", count: stats.open },
              { id: "IN_PROGRESS", label: "Đang xử lý", count: stats.inProgress },
              { id: "RESOLVED", label: "Đã giải quyết", count: stats.resolved },
              { id: "CLOSED", label: "Đã đóng", count: stats.closed },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === s.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{s.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === s.id
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">Mọi danh mục</option>
            <option value="BUG">Sự cố kỹ thuật / Micro</option>
            <option value="AI_FEEDBACK">Góp ý Giám khảo AI</option>
            <option value="FEATURE">Đề xuất tính năng</option>
            <option value="ACCOUNT">Tài khoản & Dữ liệu</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/70 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã / Tiêu Đề</th>
                <th className="py-3 px-4">Học Viên</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4">Mức Độ</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.map((ticket) => {
                const cat = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.OTHER;
                const pri = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.MEDIUM;
                const sta = STATUS_MAP[ticket.status] || STATUS_MAP.OPEN;
                const CatIcon = cat.icon;

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        <span>{ticket.id}</span>
                        {ticket.relatedSessionId && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({ticket.relatedSessionId.substring(0, 8)}...)
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                        {ticket.title}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{ticket.userName}</div>
                      <div className="text-[11px] text-slate-400">{ticket.userEmail}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${cat.color}`}>
                        <CatIcon className="h-3 w-3" />
                        <span>{cat.label}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pri.color}`}>
                        {pri.label}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sta.badge}`}>
                        {sta.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {formatDate(ticket.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTicket(ticket);
                        }}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                      >
                        Chi tiết & Phản hồi
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <LifeBuoy className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-medium">Không tìm thấy yêu cầu hỗ trợ nào</p>
                    <p className="text-xs text-slate-500 mt-0.5">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ticket Details & Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                    {selectedTicket.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_MAP[selectedTicket.priority]?.color || ""}`}>
                    {PRIORITY_MAP[selectedTicket.priority]?.label}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_MAP[selectedTicket.status]?.badge || ""}`}>
                    {STATUS_MAP[selectedTicket.status]?.label}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTicket.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* User & Device Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Học viên gửi:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedTicket.userName} &bull; <span className="font-normal text-slate-500">{selectedTicket.userEmail}</span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Thời gian gửi:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>

                {selectedTicket.relatedSessionId && (
                  <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phòng thi liên quan:</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                        {selectedTicket.relatedSessionId}
                      </span>
                    </div>
                    <Link
                      href={`/admin/sessions?search=${selectedTicket.relatedSessionId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      <span>Tra cứu phòng thi</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {selectedTicket.deviceInfo && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2">
                    <Laptop className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Thiết bị & Môi trường trình duyệt:</span>
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                        {selectedTicket.deviceInfo}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nội dung chi tiết từ học viên:
                </label>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Admin Response Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>Phản Hồi Của Đội Ngũ Quản Trị / Kỹ Thuật:</span>
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ghi chú nội dung giải quyết hoặc gửi phản hồi trực tiếp tới học viên..."
                  className="w-full p-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {actionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 flex items-center gap-2 text-xs">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[11px] text-slate-500">
                Chuyển trạng thái & Lưu phản hồi:
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => handleUpdateTicket("IN_PROGRESS")}
                  className="text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-50"
                >
                  Đang Xử Lý
                </Button>

                <Button
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => handleUpdateTicket("RESOLVED")}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Đã Xong (Resolved)
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isUpdating}
                  onClick={() => handleUpdateTicket("CLOSED")}
                  className="text-xs"
                >
                  Đóng Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
