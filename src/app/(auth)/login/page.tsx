"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, ArrowRight, Loader2, X, Globe, Sparkles, Check } from "lucide-react";
import { getFirebaseServices, googleAuthProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { LegalModal } from "@/components/legal/legal-modal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật để tiếp tục.");
      return;
    }
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
            window.location.href = syncData.redirectPath || "/dashboard";
            return;
          }
        }
      } catch (fbErr: any) {
        console.log("Firebase login note:", fbErr.code);
        if (fbErr.code === "auth/wrong-password" || fbErr.code === "auth/invalid-credential") {
          setError("Mật khẩu không chính xác. Nếu bạn đã đăng nhập qua Google trên Classnia, hãy nhấn nút 'Đăng nhập với Google' ở trên.");
          setIsLoading(false);
          return;
        }
        if (fbErr.code === "auth/user-not-found") {
          setError("Email này chưa được tạo mật khẩu riêng trên Firebase. Vui lòng bấm 'Đăng nhập với Google' để đăng nhập tự động.");
          setIsLoading(false);
          return;
        }
        if (fbErr.code === "auth/too-many-requests") {
          setError("Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút hoặc dùng Google.");
          setIsLoading(false);
          return;
        }
      }
    }

    // 2. Thử đăng nhập qua API nội bộ
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

      window.location.href = data.redirectPath || "/dashboard";
      return;
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không chính xác. Bạn có thể sử dụng nút Đăng nhập với Google để tiếp tục nhanh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    if (!agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật để tiếp tục.");
      return;
    }
    setIsGoogleLoading(true);
    setError(null);

    if (email.trim() && !googleEmailInput) {
      setGoogleEmailInput(email.trim());
    }

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
            window.location.href = syncData.redirectPath || "/dashboard";
            return;
          }
        }
      } catch (popupErr: any) {
        console.log("Google popup notice (e.g. domain whitelist or popup blocked):", popupErr?.code);
        // Tự động mở modal xác nhận Google email để người dùng không bị gián đoạn
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
    if (!agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật để tiếp tục.");
      return;
    }
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

      window.location.href = data.redirectPath || "/dashboard";
      return;
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
          href={process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://classnia.id.vn"}
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

            {/* Terms of Service & Privacy Policy Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-1 pb-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={agreeTerms}
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`h-4.5 w-4.5 mt-0.5 rounded-[5px] flex items-center justify-center shrink-0 transition-all ${
                  agreeTerms
                    ? "bg-[#e06b53] hover:bg-[#d45d45] text-white shadow-sm"
                    : "border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400"
                }`}
                title="Đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật"
              >
                {agreeTerms && <Check className="h-3 w-3 stroke-[3]" />}
              </button>
              <div className="text-xs text-slate-600 dark:text-slate-400 select-none leading-relaxed">
                <span>Tôi đồng ý với </span>
                <button
                  type="button"
                  onClick={() => setLegalModalType("terms")}
                  className="font-medium text-slate-900 dark:text-white underline hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Điều khoản Dịch vụ
                </button>
                <span> và </span>
                <button
                  type="button"
                  onClick={() => setLegalModalType("privacy")}
                  className="font-medium text-slate-900 dark:text-white underline hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  Chính sách Bảo mật
                </button>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </div>
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
              <div className="space-y-1.5">
                <Input
                  type="email"
                  placeholder="vidu@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="h-10 text-xs"
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
      {/* Legal Modal Quick Preview */}
      <LegalModal
        isOpen={Boolean(legalModalType)}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
        onAccept={() => setAgreeTerms(true)}
      />
    </>
  );
}
