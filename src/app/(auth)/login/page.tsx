"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, ArrowRight, Loader2, X, Globe, Sparkles } from "lucide-react";
import { getFirebaseServices, googleAuthProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Thử đăng nhập qua Firebase của Classnia (hsks-a320f / classnia.id.vn)
    const { auth } = getFirebaseServices();
    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = cred.user;
        if (fbUser.email) {
          const syncRes = await fetch("/api/auth/firebase-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              uid: fbUser.uid,
            }),
          });

          const syncData = await syncRes.json();
          if (syncRes.ok) {
            router.push(syncData.redirectPath || "/dashboard");
            router.refresh();
            return;
          }
        }
      } catch (fbErr: any) {
        // Nếu không có trên Firebase hoặc sai mật khẩu, tiếp tục thử DB cục bộ
        console.log("Firebase login note:", fbErr.code);
      }
    }

    // 2. Thử đăng nhập qua Database cục bộ (cho tài khoản demo hoặc nội bộ)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Email hoặc mật khẩu không chính xác");
      }

      router.push(data.redirectPath || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setIsGoogleLoading(true);
    setError(null);

    // Thử mở popup Google Firebase trước
    const { auth } = getFirebaseServices();
    if (auth) {
      try {
        const cred = await signInWithPopup(auth, googleAuthProvider);
        const fbUser = cred.user;
        if (fbUser.email) {
          const syncRes = await fetch("/api/auth/firebase-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              uid: fbUser.uid,
            }),
          });

          const syncData = await syncRes.json();
          if (syncRes.ok) {
            router.push(syncData.redirectPath || "/dashboard");
            router.refresh();
            return;
          }
        }
      } catch (popupErr: any) {
        console.log("Google popup cancelled or blocked, opening input modal:", popupErr?.code);
        // Nếu trình duyệt chặn popup, mở modal nhập email
        setShowGoogleModal(true);
      } finally {
        setIsGoogleLoading(false);
      }
      return;
    }

    setShowGoogleModal(true);
    setIsGoogleLoading(false);
  };

  const handleGoogleModalSubmit = async (targetEmail?: string) => {
    setIsGoogleLoading(true);
    setError(null);

    const emailToUse = targetEmail || googleEmailInput.trim() || "user.google@gmail.com";

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          name: emailToUse.split("@")[0] || "Người Dùng Google",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập bằng Google thất bại");
      }

      router.push(data.redirectPath || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đăng nhập bằng Google thất bại");
    } finally {
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
    }
  };

  return (
    <>
      <div className="mb-3 flex items-center text-xs">
        <a
          href="https://classnia.id.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-rose-500" />
          <span>← Quay lại <strong>Classnia.id.vn</strong></span>
        </a>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cinnabar" className="text-[10px]">
              Classnia Ecosystem
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Đăng Nhập Khảo Thí</CardTitle>
          <CardDescription>
            Sử dụng trực tiếp tài khoản Classnia (Firebase) hoặc tài khoản hệ thống để tiếp tục.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Classnia Sync Info Banner */}
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-950 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <Globe className="h-4 w-4 shrink-0 text-rose-600" />
            <div className="space-y-0.5">
              <span className="font-bold">Đồng bộ tự động cùng Classnia (classnia.id.vn)</span>
              <p className="text-[11px] opacity-90">
                Tài khoản Google hoặc Email/Mật khẩu đã đăng ký trên Classnia đều dùng được ngay tại đây.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignInClick}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-11 border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm transition-all"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Đăng nhập với Google (Classnia)</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase font-semibold">
              <span className="bg-white px-2.5 text-slate-400 dark:bg-slate-900">
                Hoặc bằng Email & Mật khẩu
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Địa Chỉ Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ten@vidu.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật Khẩu</Label>
                <Link href="#" className="text-xs text-rose-600 hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xác thực Classnia / Hệ thống...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Đăng Nhập Khảo Thí <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-rose-600 hover:underline">
              Đăng ký miễn phí
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Google Account Modal Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Đăng Nhập Với Google
              </h3>
              <p className="text-xs text-slate-500">
                Chọn tài khoản hoặc nhập Gmail của bạn để tiếp tục vào hệ thống.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => handleGoogleModalSubmit("luunhuthang2402@gmail.com")}
                disabled={isGoogleLoading}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs h-11 flex items-center justify-between px-3.5 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    T
                  </div>
                  <div className="text-left">
                    <span className="font-bold block">Tài khoản Admin</span>
                    <span className="text-[10px] text-slate-500 font-normal">luunhuthang2402@gmail.com</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-semibold">
                  <span className="bg-white px-2 text-slate-400 dark:bg-slate-900">
                    Hoặc dùng Gmail cá nhân
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Input
                  type="email"
                  placeholder="vidu@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <Button
                type="button"
                onClick={() => handleGoogleModalSubmit()}
                disabled={isGoogleLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-10"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xác thực Google...
                  </span>
                ) : (
                  <span>Tiếp tục với Gmail này</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
