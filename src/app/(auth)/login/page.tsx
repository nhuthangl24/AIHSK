"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectPath || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your speaking assessments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-rose-600 hover:underline">
                Forgot password?
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
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>One-Click Demo Test Accounts (Password: Password123!)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin("learner@aihsk.com")}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Learner</span>
              <span className="text-[10px] text-slate-500 truncate block">learner@aihsk.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("teacher@aihsk.com")}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Teacher</span>
              <span className="text-[10px] text-slate-500 truncate block">teacher@aihsk.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@oriental-edu.com")}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Org Admin</span>
              <span className="text-[10px] text-slate-500 truncate block">admin@oriental-edu.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("superadmin@aihsk.com")}
              className="p-2 text-left rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="font-semibold block text-slate-800 dark:text-slate-200">Super Admin</span>
              <span className="text-[10px] text-slate-500 truncate block">superadmin@aihsk.com</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-rose-600 hover:underline">
            Register for free
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
