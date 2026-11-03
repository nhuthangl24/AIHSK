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
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Start Assessment", href: "/dashboard/assessments", icon: PlayCircle },
  { name: "Assessment Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Learning Progress", href: "/dashboard/progress", icon: TrendingUp },
  { name: "Profile & Goals", href: "/dashboard/profile", icon: User },
  { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
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

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors">
      <div className="p-5">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-sm">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              HuáVocal <span className="text-rose-600">AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">华语考官 · 口语评测</p>
          </div>
        </Link>

        {/* Quick Start Callout */}
        <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50/60 p-3.5 dark:border-rose-950/60 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-300 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
            <span>Oral Diagnostic</span>
          </div>
          <p className="text-xs text-rose-700/80 dark:text-rose-400 mb-3 leading-relaxed">
            Ready for a 5-stage conversation with Examiner Li?
          </p>
          <Link href="/dashboard/assessments">
            <button className="w-full rounded-lg bg-rose-600 py-1.5 px-3 text-xs font-medium text-white shadow-sm hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5">
              <Mic className="h-3.5 w-3.5" />
              <span>Begin Exam</span>
            </button>
          </Link>
        </div>

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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-rose-600" : "text-slate-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="truncate max-w-[140px]">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || "Alex Chen"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "learner@aihsk.com"}</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {user?.role || "Learner"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
