"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  Settings2,
  Cpu,
  Activity,
  LogOut,
  PlayCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

const NAV_ITEMS = [
  { name: "Tổng Quan Quản Trị", href: "/admin", icon: ShieldAlert },
  { name: "Quản Lý Người Dùng", href: "/admin/users", icon: Users },
  { name: "Mẫu Đề Khảo Thí", href: "/admin/templates", icon: Settings2 },
  { name: "Cấu Hình Mô Hình AI", href: "/admin/ai-config", icon: Cpu },
  { name: "Hàng Đợi & Hệ Thống", href: "/admin/jobs", icon: Activity },
];

export function AdminSidebar({ user }: { user?: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
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

  return (
    <>
      {/* Mobile Top Header for Admin */}
      <div className="flex md:hidden sticky top-0 z-30 h-14 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-purple-200/80 dark:border-purple-900/60 px-3.5 items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <BrandLogo size={28} />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white">Admin</span>
            <span className="text-[10px] font-extrabold bg-purple-600 text-white px-1.5 py-0.2 rounded-md">
              PORTAL
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1.5 rounded-xl border border-purple-200"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Learner App</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100"
            aria-label="Mở menu admin"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xl z-10 p-4 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <BrandLogo size={32} />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Classnia <span className="text-purple-600">Admin</span>
                    </h2>
                    <p className="text-[10px] text-slate-500">Quản Trị Hệ Thống</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-purple-600" : "text-slate-500")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <PlayCircle className="h-3.5 w-3.5 text-rose-600" />
                <span>Vào Phòng Khảo Thí (User)</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors">
        <div className="p-5">
          <Link href="/admin" className="flex items-center gap-2.5 mb-8 group">
            <BrandLogo size={36} />
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Classnia <span className="text-purple-600">Quản Trị</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Hệ Thống & Khảo Thí AI</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-purple-600" : "text-slate-500")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate max-w-[140px]">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "Quản trị viên"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "superadmin@aihsk.com"}</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Admin
            </span>
          </div>

          <Link
            href="/dashboard"
            className="w-full mb-2 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
          >
            <PlayCircle className="h-3.5 w-3.5 text-rose-600" />
            <span>Vào Phòng Khảo Thí (User)</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
