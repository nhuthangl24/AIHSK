"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";

interface MarketingHeaderProps {
  initialUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export function MarketingHeader({ initialUser = null }: MarketingHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Sync client-side session on mount as a fallback/enhancement
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          setCurrentUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
        } else if (!initialUser) {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        // Silently preserve initialUser on network issue
      });

    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setMobileMenuOpen(false);
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "HV";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo size={40} />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Classnia <span className="text-rose-600">AI</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 tracking-wider -mt-1">
              Khảo Thí Khẩu Ngữ Tiếng Trung AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (Pricing removed - 100% Free platform) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/features" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Tính Năng
          </Link>
          <Link href="/about" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Cách Hoạt Động
          </Link>
          <Link href="/faq" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Hỏi Đáp
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Classnia.id.vn</span>
          </a>

          {currentUser ? (
            /* Logged-in State: Show User Profile Chip + Enter Dashboard Button */
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Hồ sơ cá nhân"
              >
                <div className="h-6 w-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800">
                  {userInitials}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[130px] truncate">
                  {currentUser.name || "Học Viên"}
                </span>
              </Link>

              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs font-bold text-xs rounded-xl flex items-center gap-1.5 px-3.5"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Vào Bảng Điều Khiển</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            /* Guest / Logged-out State */
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium text-slate-700 dark:text-slate-200">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-medium flex items-center gap-1.5">
                  <span>Bắt Đầu Khảo Thí</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 dark:text-slate-200"
          aria-label="Mở menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 dark:border-slate-800 dark:bg-slate-950 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3 pt-2 pb-4">
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-base font-medium text-slate-700 hover:text-rose-600 dark:text-slate-200"
            >
              Tính Năng
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-base font-medium text-slate-700 hover:text-rose-600 dark:text-slate-200"
            >
              Cách Hoạt Động
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-base font-medium text-slate-700 hover:text-rose-600 dark:text-slate-200"
            >
              Hỏi Đáp
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {currentUser ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {userInitials}
                  </div>
                  <div className="truncate min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {currentUser.name || "Học Viên"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email || ""}</p>
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 h-10">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Vào Bảng Điều Khiển</span>
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Đăng Nhập
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white">
                    Bắt Đầu Khảo Thí Miễn Phí
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
