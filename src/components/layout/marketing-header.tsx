"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/brand-logo";

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/features" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Tính Năng
          </Link>
          <Link href="/about" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Cách Hoạt Động
          </Link>
          <Link href="/pricing" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Bảng Giá
          </Link>
          <Link href="/faq" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            Hỏi Đáp
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://classnia.id.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Classnia.id.vn</span>
          </a>
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
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 dark:border-slate-800 dark:bg-slate-950">
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
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-base font-medium text-slate-700 hover:text-rose-600 dark:text-slate-200"
            >
              Bảng Giá
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1 text-base font-medium text-slate-700 hover:text-rose-600 dark:text-slate-200"
            >
              Hỏi Đáp
            </Link>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Đăng Nhập
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center bg-rose-600 hover:bg-rose-700 text-white">
                Bắt Đầu Đánh Giá Miễn Phí
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
