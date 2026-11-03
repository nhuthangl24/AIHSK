"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          router.replace(data.user.role === "ADMIN" ? "/admin" : "/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        if (isMounted) router.replace("/login");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-3" />
      <p className="text-xs text-slate-500 font-medium">Đang chuyển hướng tới Classnia AI...</p>
    </div>
  );
}
