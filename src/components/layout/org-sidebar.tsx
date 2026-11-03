"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Users,
  PieChart,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Organization Overview", href: "/organization", icon: Building2 },
  { name: "Faculty & Teachers", href: "/organization/teachers", icon: Users },
  { name: "Institutional Analytics", href: "/organization/analytics", icon: PieChart },
  { name: "Licenses & Seats", href: "/organization/licenses", icon: ShieldCheck },
  { name: "Organization Settings", href: "/organization/settings", icon: Settings },
];

export function OrgSidebar({ user }: { user?: { name: string; email: string; role: string } }) {
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
        <Link href="/organization" className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              HuáVocal <span className="text-emerald-600">Enterprise</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">机构端 · 多租户考评管理</p>
          </div>
        </Link>

        <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Multi-Tenant Portal</span>
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400 leading-relaxed">
            Manage teacher departments, bulk student licenses, and compliance exports.
          </p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/organization"
                ? pathname === "/organization"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-emerald-600" : "text-slate-500")} />
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
              {user?.name || "Director Wang"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "admin@oriental-edu.com"}</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Org Admin
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
