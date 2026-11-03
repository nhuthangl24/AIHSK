"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Mic,
  LayoutDashboard,
  PlayCircle,
  FileText,
  TrendingUp,
  User,
  LogOut,
  Globe,
  Coins,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

const NAV_ITEMS = [
  { name: "Tổng Quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bắt Đầu Thi Nói", href: "/dashboard/assessments", icon: PlayCircle },
  { name: "Báo Cáo Đánh Giá", href: "/dashboard/reports", icon: FileText },
  { name: "Tiến Độ Khẩu Ngữ", href: "/dashboard/progress", icon: TrendingUp },
  { name: "Hồ Sơ & Mục Tiêu", href: "/dashboard/profile", icon: User },
];

export function DashboardSidebar({ user }: { user?: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "HV";

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors z-20">
      <div className="p-5 overflow-y-auto">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-6 group">
          <BrandLogo size={36} />
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Classnia <span className="text-rose-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Khảo Thí Khẩu Ngữ Tiếng Trung</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-rose-600" : "text-slate-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Credit Học Thử Widget */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/80 dark:border-amber-900/50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-600" />
              <span>Credit Học Thử</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60">
              Miễn Phí
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-extrabold text-amber-950 dark:text-amber-200">
              200 <span className="text-xs font-normal text-amber-700 dark:text-amber-400">/ 200 Credits</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">100% Khả dụng</span>
          </div>
          <div className="h-1.5 w-full bg-amber-200/70 dark:bg-amber-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-full" />
          </div>
          <p className="text-[10px] text-amber-800/80 dark:text-amber-300/70 leading-relaxed">
            Mỗi tài khoản được cấp sẵn 200 Credit miễn phí để trải nghiệm trọn vẹn phòng thi khẩu ngữ.
          </p>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
            {userInitials}
          </div>
          <div className="truncate min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "Alex Chen"}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{user?.email || "learner@aihsk.com"}</p>
          </div>
        </div>

        <a
          href="https://classnia.id.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors shadow-2xs"
        >
          <Globe className="h-3.5 w-3.5 text-rose-600" />
          <span>Về Classnia.id.vn</span>
        </a>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
}

