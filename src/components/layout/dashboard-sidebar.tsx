"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlayCircle,
  FileText,
  TrendingUp,
  User,
  LogOut,
  Globe,
  Shield,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LegalModal } from "@/components/legal/legal-modal";

const NAV_ITEMS = [
  { name: "Tổng Quan", shortName: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bắt Đầu Thi Nói", shortName: "Thi nói", href: "/dashboard/assessments", icon: PlayCircle },
  { name: "Trò Chuyện Tự Do", shortName: "Tự do", href: "/dashboard/free-talk", icon: MessageCircle },
  { name: "Báo Cáo Đánh Giá", shortName: "Báo cáo", href: "/dashboard/reports", icon: FileText },
  { name: "Tiến Độ Khẩu Ngữ", shortName: "Tiến độ", href: "/dashboard/progress", icon: TrendingUp },
  { name: "Hồ Sơ & Mục Tiêu", shortName: "Hồ sơ", href: "/dashboard/profile", icon: User },
  { name: "Yêu Cầu & Hỗ Trợ", shortName: "Hỗ trợ", href: "/dashboard/support", icon: HelpCircle },
];

export function DashboardSidebar({
  user,
}: {
  user?: { name: string; email: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy" | null>(null);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

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
    <>
      {/* ==================================================================== */}
      {/* 1. MOBILE TOP NAVIGATION BAR (Visible on < md screens)               */}
      {/* ==================================================================== */}
      <div className="flex md:hidden sticky top-0 z-30 h-14 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3.5 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BrandLogo size={28} />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Classnia</span>
            <span className="text-[10px] font-extrabold bg-rose-600 text-white px-1.5 py-0.2 rounded-md">
              AI
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/assessments"
            className="flex items-center gap-1 text-[11px] font-bold text-white bg-rose-600 px-2.5 py-1.5 rounded-xl shadow-xs"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Thi Ngay</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MOBILE DRAWER OVERLAY & SLIDE-OUT PANEL                           */}
      {/* ==================================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 overflow-y-auto">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <BrandLogo size={32} />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Classnia <span className="text-rose-600">AI</span>
                    </h2>
                    <p className="text-[10px] text-slate-500">Khảo Thí Khẩu Ngữ HSK</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
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
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-rose-600" : "text-slate-500")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* User Info & Footer Actions */}
            <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
              <div className="flex items-center gap-2.5 px-1 pb-1">
                <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                  {userInitials}
                </div>
                <div className="truncate min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name || "Học Viên"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email || ""}</p>
                </div>
              </div>

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-purple-600" />
                  <span>Trang Quản Trị</span>
                </Link>
              )}

              <a
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-rose-600" />
                <span>Về Classnia.id.vn</span>
              </a>

              <div className="flex items-center justify-center gap-2 pt-1 pb-0.5 text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setLegalModalType("terms")}
                  className="hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors flex items-center gap-1"
                >
                  <FileText className="h-3 w-3 text-slate-400" />
                  <span>Điều khoản</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setLegalModalType("privacy")}
                  className="hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="h-3 w-3 text-slate-400" />
                  <span>Bảo mật & Dữ liệu</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MOBILE BOTTOM NAVIGATION DOCK (Ergonomic thumb access on phones)  */}
      {/* ==================================================================== */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/80 dark:border-slate-800/80 backdrop-blur-lg px-0.5 items-center justify-around shadow-sm">
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
                "flex-1 min-w-0 flex flex-col items-center justify-center py-1 transition-all",
                isActive
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-6 sm:w-10 sm:h-7 rounded-full transition-all",
                  isActive
                    ? "bg-rose-100/80 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate max-w-full px-0.5">
                {item.shortName}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ==================================================================== */}
      {/* 4. DESKTOP PERMANENT SIDEBAR (Visible on >= md screens)              */}
      {/* ==================================================================== */}
      <aside className="hidden md:flex w-64 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors z-20">
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
                  {user?.name || "Học Viên"}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || "learner@aihsk.com"}</p>
            </div>
          </div>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 transition-colors shadow-2xs"
            >
              <Shield className="h-3.5 w-3.5 text-purple-600" />
              <span>Trang Quản Trị (Admin)</span>
            </Link>
          )}

          <a
            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/60 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100/60 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition-colors shadow-2xs"
          >
            <Globe className="h-3.5 w-3.5 text-rose-600" />
            <span>Về Classnia.id.vn</span>
          </a>

          <div className="flex items-center justify-center gap-2 pt-1 pb-0.5 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={() => setLegalModalType("terms")}
              className="hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors flex items-center gap-1"
            >
              <FileText className="h-3 w-3 text-slate-400" />
              <span>Điều khoản</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => setLegalModalType("privacy")}
              className="hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="h-3 w-3 text-slate-400" />
              <span>Bảo mật & Dữ liệu</span>
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Embedded Terms & Privacy Policy Modal */}
      <LegalModal
        isOpen={legalModalType !== null}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </>
  );
}
