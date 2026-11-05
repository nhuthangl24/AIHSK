"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Headphones,
  Mail,
  PhoneCall,
  Laptop,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Flame,
  Check,
  RotateCcw,
  ShieldCheck,
  Mic,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StoredSupportTicket } from "@/lib/db/assessment-store";
import { cn } from "@/lib/utils";

interface SupportClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  initialTickets: StoredSupportTicket[];
}

const CATEGORIES = [
  {
    id: "BUG" as const,
    label: "Báo Lỗi Kỹ Thuật",
    desc: "Micro, loa, ngắt kết nối, lỗi phòng thi...",
    icon: Bug,
    color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900",
  },
  {
    id: "AI_FEEDBACK" as const,
    label: "Góp Ý AI Giám Khảo",
    desc: "Chấm điểm, ngữ điệu, pinyin, câu hỏi...",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
  },
  {
    id: "FEATURE" as const,
    label: "Đề Xuất Tính Năng",
    desc: "Thêm đề thi, công cụ luyện từ vựng, giao diện...",
    icon: Lightbulb,
    color: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-900",
  },
  {
    id: "ACCOUNT" as const,
    label: "Tài Khoản & Dữ Liệu",
    desc: "Đăng nhập, đồng bộ lịch sử thi, hồ sơ học...",
    icon: UserCheck,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
  },
  {
    id: "OTHER" as const,
    label: "Thắc Mắc Khác",
    desc: "Hỏi đáp lộ trình HSK, hướng dẫn sử dụng...",
    icon: MessageSquare,
    color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
  },
];

const PRIORITIES = [
  {
    id: "LOW" as const,
    label: "Bình thường",
    hint: "Góp ý chung hoặc đề xuất",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    id: "MEDIUM" as const,
    label: "Cần chú ý",
    hint: "Ảnh hưởng trải nghiệm nhẹ",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "HIGH" as const,
    label: "Cần gấp",
    hint: "Lỗi chức năng quan trọng",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    id: "URGENT" as const,
    label: "Khẩn cấp",
    hint: "Đang bị kẹt giữa bài thi",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
];

const QUICK_TITLE_SUGGESTIONS = [
  "Micro không nhận được giọng nói khi trả lời",
  "Giám khảo AI không phát âm thanh câu hỏi",
  "Bị lỗi ngắt kết nối giữa chặng thi",
  "Báo cáo đánh giá chưa cập nhật điểm chuẩn xác",
  "Góp ý bổ sung thêm chủ đề HSKK Trung Cấp",
  "Đề xuất tính năng phát âm lại từng từ Pinyin",
];

const FAQ_ITEMS = [
  {
    q: "Micro không nhận giọng nói hoặc trình duyệt báo bị chặn?",
    a: "Hãy nhấp vào biểu tượng ổ khóa 🔒 trên thanh địa chỉ trình duyệt, chọn 'Quyền trang web' (Site settings) và chuyển Micro sang 'Cho phép' (Allow). Sau đó tải lại trang (F5) và thử lại.",
  },
  {
    q: "Không nghe được tiếng Giám khảo AI nói?",
    a: "1. Kiểm tra âm lượng loa hoặc tai nghe.\n2. Bấm nút 'Nghe lại' hoặc chuyển tốc độ đọc (0.95x) để hệ thống tải lại luồng âm thanh.\n3. Nếu dùng trình duyệt Safari trên iOS, hãy chạm vào màn hình 1 lần để cấp quyền tự động phát âm thanh.",
  },
  {
    q: "Đang thi mà bị mất kết nối hoặc lỡ tải lại trang thì có mất bài không?",
    a: "Hệ thống tự động lưu trữ tức thì từng câu trả lời (turns) vào bộ nhớ. Bạn có thể mở lại đúng đường dẫn bài thi để tiếp tục từ chặng gần nhất mà không cần thi lại từ đầu.",
  },
  {
    q: "Hệ thống AI chấm điểm dựa trên tiêu chí nào?",
    a: "Classnia AI sử dụng mô hình Rubric 4 tiêu chí chuẩn Khảo thí Quốc tế HSKK: Phát âm & Thanh điệu (Pronunciation), Độ trôi chảy & Ngữ điệu (Fluency), Từ vựng & Ngữ pháp (Grammar/Lexicon), và Độ mạch lạc & Phản xạ chủ đề (Coherence).",
  },
  {
    q: "Bao lâu thì yêu cầu hỗ trợ của tôi được phản hồi?",
    a: "Đội ngũ kỹ thuật và cố vấn sư phạm Classnia thường kiểm tra các yêu cầu gắn nhãn 'Khẩn cấp' trong vòng 10-20 phút, và các yêu cầu khác trong vòng 2-4 giờ làm việc.",
  },
];

const LOCAL_STORAGE_TICKETS_KEY = "aihsk_support_tickets_cache";

export default function SupportClient({ user, initialTickets }: SupportClientProps) {
  const searchParams = useSearchParams();

  // Form states
  const [category, setCategory] = useState<"BUG" | "AI_FEEDBACK" | "FEATURE" | "ACCOUNT" | "OTHER">("BUG");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [relatedSessionId, setRelatedSessionId] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  // Status & List states
  const [tickets, setTickets] = useState<StoredSupportTicket[]>(initialTickets || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketFilter, setTicketFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-detect client device info and prefill URL params on mount
  useEffect(() => {
    try {
      const urlSession = searchParams?.get("session");
      if (urlSession) {
        setRelatedSessionId(urlSession);
        setTitle(`Lỗi phòng thi #${urlSession.substring(0, 16)}...`);
      }

      const urlCategory = searchParams?.get("category")?.toUpperCase();
      if (urlCategory && CATEGORIES.some((c) => c.id === urlCategory)) {
        setCategory(urlCategory as any);
      }

      // Collect system diagnostics
      if (typeof window !== "undefined") {
        const ua = navigator.userAgent;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const lang = navigator.language;
        const info = `Platform: ${navigator.platform} | Screen: ${width}x${height} | Lang: ${lang} | UA: ${ua}`;
        setDeviceInfo(info);

        // Merge with locally stored tickets if any exist offline
        const cached = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
        if (cached) {
          try {
            const parsed: StoredSupportTicket[] = JSON.parse(cached);
            setTickets((prev) => {
              const map = new Map<string, StoredSupportTicket>();
              parsed.forEach((t) => map.set(t.id, t));
              prev.forEach((t) => map.set(t.id, t));
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          } catch {
            // Ignore corrupted local cache
          }
        }
      }

      const mergeLearnerTickets = (
        sourceA: StoredSupportTicket[],
        sourceB: StoredSupportTicket[]
      ) => {
        const map = new Map<string, StoredSupportTicket>();
        sourceA.forEach((t) => t?.id && map.set(t.id, t));
        sourceB.forEach((t) => {
          if (!t?.id) return;
          const existing = map.get(t.id);
          if (!existing || new Date(t.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
            map.set(t.id, t);
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      };

      // Fresh fetch helper with no-cache, timestamp and lambda sync
      const fetchLatest = () => {
        let localTickets: StoredSupportTicket[] = [];
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
          if (cached) localTickets = JSON.parse(cached);
        } catch {}

        if (Array.isArray(localTickets) && localTickets.length > 0) {
          fetch("/api/support/ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "sync", localTickets }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.tickets && Array.isArray(data.tickets)) {
                setTickets((prev) => {
                  const merged = mergeLearnerTickets(prev, data.tickets);
                  try {
                    localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(merged));
                  } catch {}
                  return merged;
                });
              }
            })
            .catch(() => {});
        } else {
          fetch(`/api/support/ticket?_t=${Date.now()}`, {
            cache: "no-store",
            headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.tickets && Array.isArray(data.tickets)) {
                setTickets((prev) => {
                  const merged = mergeLearnerTickets(prev, data.tickets);
                  try {
                    localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(merged));
                  } catch {}
                  return merged;
                });
              }
            })
            .catch(() => {});
        }
      };

      // Always fetch latest tickets from server immediately
      fetchLatest();

      // Listen for real-time cross-tab updates (e.g. when admin resolves in another tab)
      let bc: BroadcastChannel | null = null;
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("classnia_support_sync");
        bc.onmessage = (event) => {
          if (event.data?.type === "TICKET_UPDATED" && event.data?.ticket) {
            const updated: StoredSupportTicket = event.data.ticket;
            setTickets((prev) => {
              const next = prev.map((t) => (t.id === updated.id ? updated : t));
              if (!next.some((t) => t.id === updated.id)) {
                next.unshift(updated);
              }
              try {
                localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        };
      }

      // Auto-poll every 12 seconds to ensure user sees admin response without hard reload
      const pollTimer = setInterval(fetchLatest, 12000);

      return () => {
        clearInterval(pollTimer);
        if (bc) bc.close();
      };
    } catch (e) {
      console.warn("Diagnostics note:", e);
    }
  }, [searchParams]);

  const handleRefreshTickets = async () => {
    setIsRefreshing(true);
    try {
      let localTickets: StoredSupportTicket[] = [];
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
        if (cached) localTickets = JSON.parse(cached);
      } catch {}

      let res: Response;
      if (Array.isArray(localTickets) && localTickets.length > 0) {
        res = await fetch("/api/support/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync", localTickets }),
        });
      } else {
        res = await fetch(`/api/support/ticket?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        });
      }

      const data = await res.json();
      if (data.tickets && Array.isArray(data.tickets)) {
        setTickets((prev) => {
          const map = new Map<string, StoredSupportTicket>();
          prev.forEach((t) => t?.id && map.set(t.id, t));
          data.tickets.forEach((t: StoredSupportTicket) => {
            if (!t?.id) return;
            const existing = map.get(t.id);
            if (!existing || new Date(t.updatedAt || 0) >= new Date(existing.updatedAt || 0)) {
              map.set(t.id, t);
            }
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          try {
            localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn("Failed to refresh tickets:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (title.trim().length < 3) {
      setErrorMessage("Vui lòng nhập tiêu đề tóm tắt ngắn gọn (ít nhất 3 ký tự).");
      return;
    }

    if (description.trim().length < 8) {
      setErrorMessage("Vui lòng mô tả chi tiết vấn đề hoặc góp ý (tối thiểu 8 ký tự) để chúng mình hỗ trợ bạn tốt nhất.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        category,
        priority,
        title: title.trim(),
        description: description.trim(),
        relatedSessionId: relatedSessionId.trim() || null,
        deviceInfo: deviceInfo.trim() || null,
      };

      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại!");
      }

      const createdTicket: StoredSupportTicket = data.ticket;

      // Update state & persist to local storage
      setTickets((prev) => {
        const next = [createdTicket, ...prev];
        try {
          localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage quota
        }
        return next;
      });

      // Broadcast creation to other tabs (e.g. Admin desk)
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("classnia_support_sync");
          bc.postMessage({ type: "TICKET_CREATED", ticket: createdTicket });
          bc.close();
        } catch {}
      }

      setSuccessMessage(data.message || `Đã tiếp nhận yêu cầu mã #${createdTicket.id}!`);
      setTitle("");
      setDescription("");
      if (!searchParams?.get("session")) {
        setRelatedSessionId("");
      }

      // Scroll smoothly to success notice or tickets list
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra sự cố kết nối. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  const filteredTickets = tickets.filter((ticket) => {
    if (ticketFilter === "OPEN") {
      return ticket.status === "OPEN" || ticket.status === "IN_PROGRESS";
    }
    if (ticketFilter === "RESOLVED") {
      return ticket.status === "RESOLVED" || ticket.status === "CLOSED";
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ==================================================================== */}
      {/* 1. PAGE HEADER & BETA ALERT BANNER                                   */}
      {/* ==================================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trung Tâm Hỗ Trợ & Báo Lỗi
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Nếu bạn gặp sự cố về micro, âm thanh phòng thi hoặc cần hỗ trợ tài khoản, hãy gửi yêu cầu tại đây để đội ngũ kỹ thuật xử lý nhanh chóng.
            </p>
          </div>

          {/* Quick contact shortcuts */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <a
              href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all shadow-sm"
            >
              <Headphones className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Cộng Đồng Học Viên Classnia</span>
              <ExternalLink className="h-3 w-3 opacity-60 ml-auto" />
            </a>
          </div>
        </div>
      </div>

      {/* Global Success / Error Feedback Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold">Đã gửi yêu cầu thành công!</p>
            <p className="mt-0.5 opacity-90">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-800 dark:text-rose-200 animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold">Lỗi không thể gửi yêu cầu:</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-900 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN 2-COLUMN LAYOUT: TICKET FORM (LEFT) & FAQ + LIST (RIGHT)     */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* ================================================================== */}
        {/* LEFT COLUMN: TICKET SUBMISSION FORM (7 Cols)                       */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 sm:p-7 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                  <Send className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Gửi Yêu Cầu / Báo Lỗi Mới
                  </h2>
                  <p className="text-xs text-slate-500">
                    Phản hồi của bạn giúp Classnia AI hoàn thiện hơn mỗi ngày
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  1. Phân loại vấn đề <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all",
                          isSelected
                            ? "border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-rose-500 shadow-xs"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40"
                        )}
                      >
                        <div
                          className={cn(
                            "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            cat.color
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-xs font-bold truncate",
                              isSelected ? "text-rose-700 dark:text-rose-300" : "text-slate-800 dark:text-slate-200"
                            )}
                          >
                            {cat.label}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
                            {cat.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  2. Mức độ ưu tiên
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={cn(
                          "py-2 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center",
                          isSelected
                            ? "border-rose-600 bg-rose-50 text-rose-700 font-bold dark:bg-rose-950/40 dark:text-rose-300 ring-1 ring-rose-500"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <span className="text-xs font-bold">{p.label}</span>
                        <span className="text-[9.5px] text-slate-400 truncate mt-0.5">{p.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  3. Tiêu đề tóm tắt <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Gợi ý nhanh:</span>
                  {QUICK_TITLE_SUGGESTIONS.slice(0, 4).map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTitle(sugg)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700 truncate max-w-xs text-left"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Giám khảo AI không nói ở Chặng 3, hoặc Mic bị ngắt quãng..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                  required
                />
              </div>

              {/* Related Session ID (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mã bài thi / Phòng thi liên quan (nếu có)
                </label>
                <input
                  type="text"
                  value={relatedSessionId}
                  onChange={(e) => setRelatedSessionId(e.target.value)}
                  placeholder="Ví dụ: session_1793787540973_... (không bắt buộc)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nếu bạn gặp sự cố trong phòng thi, mã phòng thi giúp kỹ sư truy vết log chính xác 100%.
                </p>
              </div>

              {/* Detailed Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    4. Mô tả chi tiết vấn đề & góp ý <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {description.length} ký tự (tối thiểu 8)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể chuyện gì đã xảy ra: Bạn đang nói đến câu nào? Giám khảo phản hồi ra sao? Bạn mong muốn tính năng hoạt động như thế nào?..."
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                  required
                />
              </div>

              {/* Auto Diagnostics / Device info accordion */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <button
                  type="button"
                  onClick={() => setShowDeviceInfo(!showDeviceInfo)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-slate-400" />
                    <span>Thông tin chẩn đoán kỹ thuật thiết bị (Tự động đính kèm)</span>
                  </div>
                  {showDeviceInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showDeviceInfo && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 font-mono break-all leading-relaxed">
                    {deviceInfo || "Đang tải thông tin trình duyệt..."}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Người gửi: <strong className="text-slate-700 dark:text-slate-300">{user.name}</strong> ({user.email})
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-rose-600/20 shrink-0 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang tiếp nhận...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Gửi Báo Cáo Ngay</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: FAQ ACCORDION + SUBMITTED TICKETS HISTORY (5 Cols)   */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. FAQ ACCORDION */}
          <Card className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <HelpCircle className="h-5 w-5 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Khắc Phục Nhanh Sự Cố Thường Gặp
                </h3>
                <p className="text-[11px] text-slate-500">
                  Các mẹo xử lý lỗi phổ biến trong phòng thi
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-start justify-between gap-3 p-3 text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3 pb-3 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-2 whitespace-pre-line">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 2. SUBMITTED TICKETS HISTORY */}
          <Card className="p-5 sm:p-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Yêu Cầu Đã Gửi Của Bạn ({tickets.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lịch sử theo dõi tiến độ xử lý và phản hồi từ kỹ thuật viên
                </p>
              </div>

              {/* Filter tabs & Refresh button - cleanly aligned without awkward wrapping */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => setTicketFilter("ALL")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs",
                      ticketFilter === "ALL"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span>Tất cả</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {tickets.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketFilter("OPEN")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs",
                      ticketFilter === "OPEN"
                        ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span>Chờ xử lý</span>
                    {openCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {openCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketFilter("RESOLVED")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap text-xs",
                      ticketFilter === "RESOLVED"
                        ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <span>Đã xử lý</span>
                    {resolvedCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {resolvedCount}
                      </span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshTickets}
                  title="Cập nhật trạng thái mới nhất"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-rose-500")} />
                </button>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="py-10 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Inbox className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {ticketFilter === "ALL"
                      ? "Hiện bạn chưa có yêu cầu nào."
                      : ticketFilter === "OPEN"
                      ? "Không có yêu cầu nào đang chờ xử lý."
                      : "Chưa có yêu cầu nào đã hoàn tất xử lý."}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Khi bạn gửi phản hồi hoặc báo lỗi qua biểu mẫu bên cạnh, mã yêu cầu và tiến độ xử lý từ kỹ thuật viên sẽ hiển thị tại đây.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredTickets.map((t) => {
                  const isResolved = t.status === "RESOLVED" || t.status === "CLOSED";
                  const isUrgent = t.priority === "URGENT";

                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-xs space-y-2.5",
                        isResolved
                          ? "bg-emerald-50/40 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 shadow-2xs"
                          : isUrgent
                          ? "bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900"
                          : "bg-slate-50/50 border-slate-200/80 dark:bg-slate-950/50 dark:border-slate-800"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          #{t.id}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {t.priority === "URGENT" && (
                            <Badge
                              variant="outline"
                              className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300 text-[9px] font-bold px-1.5 py-0"
                            >
                              Khẩn cấp
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5",
                              isResolved
                                ? "bg-emerald-600 text-white border-transparent"
                                : t.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                            )}
                          >
                            {isResolved
                              ? "✓ Đã xử lý xong"
                              : t.status === "IN_PROGRESS"
                              ? "⏳ Đang xử lý"
                              : "Đã tiếp nhận"}
                          </Badge>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {t.title}
                      </h4>

                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {t.description}
                      </p>

                      {/* Compact Resolution Box when ticket is resolved or admin responded */}
                      {isResolved ? (
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>Phản hồi từ Kỹ thuật viên:</span>
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 font-medium">
                              {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : ""}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                            {t.adminResponse || "Kỹ thuật viên đã kiểm tra và khắc phục sự cố cho tài khoản của bạn. Bạn có thể an tâm tiếp tục luyện tập!"}
                          </p>

                          {/* Direct compact action links */}
                          <div className="flex items-center gap-2 pt-0.5 text-[11px] flex-wrap">
                            {t.relatedSessionId ? (
                              <>
                                <Link
                                  href={`/dashboard/assessments/${t.relatedSessionId}`}
                                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Vào lại bài thi</span>
                                </Link>
                                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                                <Link
                                  href="/dashboard/assessments"
                                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:underline flex items-center gap-1"
                                >
                                  <Mic className="h-3 w-3 text-rose-500" />
                                  <span>Thi đề mới</span>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link
                                  href="/dashboard/assessments"
                                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Mic className="h-3 w-3" />
                                  <span>Vào phòng thi</span> &rarr;
                                </Link>
                                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                                <Link
                                  href="/dashboard/free-talk"
                                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:underline flex items-center gap-1"
                                >
                                  <Sparkles className="h-3 w-3 text-amber-500" />
                                  <span>Trò chuyện tự do</span>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      ) : t.adminResponse ? (
                        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-950 dark:text-blue-200 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-blue-800 dark:text-blue-300">
                              Phản hồi từ Kỹ thuật viên:
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 font-medium">
                              {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : ""}
                            </span>
                          </div>
                          <p className="leading-relaxed">{t.adminResponse}</p>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        <span>
                          Gửi lúc: {new Date(t.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {t.relatedSessionId && (
                          <span className="font-mono truncate max-w-[140px]">
                            Phòng: {t.relatedSessionId.substring(0, 14)}...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
