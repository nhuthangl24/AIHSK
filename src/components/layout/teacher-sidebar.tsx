"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Teacher Overview", href: "/teacher", icon: GraduationCap },
  { name: "My Classes & Rosters", href: "/teacher/classes", icon: Users },
  { name: "Assignments", href: "/teacher/assignments", icon: ClipboardList },
  { name: "Student Performance", href: "/teacher/analytics", icon: BarChart3 },
];

export function TeacherSidebar({ user }: { user?: { name: string; email: string; role: string } }) {
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
        <Link href="/teacher" className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              HuáVocal <span className="text-blue-600">Teacher</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">教师端 · 教学与班级考评</p>
          </div>
        </Link>

        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 dark:border-blue-950/60 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Classroom Mode</span>
          </div>
          <p className="text-xs text-blue-700/80 dark:text-blue-400 leading-relaxed">
            Assign spoken assessments to student cohorts and review full transcripts.
          </p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/teacher"
                ? pathname === "/teacher"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-500")} />
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
              {user?.name || "Prof. Zhang"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email || "teacher@aihsk.com"}</p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            Teacher
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
