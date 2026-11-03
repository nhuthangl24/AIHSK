"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>("pro");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpgrade = async (slug: string) => {
    setIsUpgrading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: slug }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");

      setCurrentPlan(slug);
      setMessage(data.message || `Successfully switched to ${slug.toUpperCase()} plan!`);
    } catch (err: any) {
      alert(err.message || "Failed to upgrade subscription");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          SaaS Subscription & Usage
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Manage your assessment quota, audio storage retention, and educational plan tiers.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            slug: "free",
            name: "Free Starter",
            price: "$0",
            period: "/month",
            desc: "Basic assessment baseline.",
            features: [
              "3 Assessments / month",
              "Standard AI Examiner",
              "Basic score reports",
              "Standard audio compression",
            ],
          },
          {
            slug: "pro",
            name: "Pro Learner",
            price: "$19",
            period: "/month",
            desc: "Comprehensive feedback for serious speakers.",
            features: [
              "30 Assessments / month",
              "Tone sandhi acoustic diagnostics",
              "Granular grammar & vocabulary coaching",
              "Unlimited audio replay",
              "PDF report downloads",
              "Weekly learning roadmap",
            ],
          },
          {
            slug: "teacher",
            name: "Educator Class",
            price: "$49",
            period: "/month",
            desc: "Classrooms, rosters, and assignments.",
            features: [
              "120 Assessments / month",
              "Classroom roster creation",
              "Oral assignment dispatch",
              "Class gradebook export",
              "Custom rubric weights",
            ],
          },
        ].map((plan) => {
          const isCurrent = currentPlan === plan.slug;

          return (
            <Card
              key={plan.slug}
              className={`flex flex-col justify-between border-slate-200 dark:border-slate-800 ${
                isCurrent ? "border-2 border-rose-600 shadow-lg" : ""
              }`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h3>
                  {isCurrent && (
                    <Badge variant="cinnabar" className="text-[10px]">
                      Active Plan
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">{plan.desc}</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-6 pt-0">
                <Button
                  onClick={() => handleUpgrade(plan.slug)}
                  disabled={isCurrent || isUpgrading}
                  className={`w-full text-xs font-semibold ${
                    isCurrent
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-800"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {isCurrent ? "Current Plan" : "Switch to " + plan.name}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
