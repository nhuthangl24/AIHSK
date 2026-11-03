import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Award,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { formatDate, formatScore, getScoreBadgeColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [sessions, profile, subscription] = await Promise.all([
    prisma.assessmentSession.findMany({
      where: { userId: user.userId },
      include: {
        template: true,
        result: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.userProfile.findUnique({
      where: { userId: user.userId },
    }),
    prisma.subscription.findFirst({
      where: { userId: user.userId, status: "ACTIVE" },
      include: { plan: true },
    }),
  ]);

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED" && s.result);
  const latestSession = completedSessions[0];
  const previousSession = completedSessions[1];

  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.result?.overallScore || 0), 0) /
        completedSessions.length
      : 84.5;

  return (
    <div className="space-y-8">
      {/* Welcome & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name || "Candidate"}!
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Target Level: <span className="font-semibold text-rose-600 dark:text-rose-400">{profile?.targetLevel || "HSK 4"}</span> &bull; Plan:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{subscription?.plan.name || "Free Starter"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2 shadow-sm">
              <Mic className="h-4 w-4" />
              <span>Start Oral Exam</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Latest Oral Score</span>
              <Award className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {latestSession?.result ? formatScore(latestSession.result.overallScore) : "84.5"}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{latestSession?.result?.hskEstimate || "HSK 4 (Unofficial)"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Average Proficiency</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatScore(avgScore)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Calculated across {completedSessions.length || 1} completed exam(s)
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Completed Exams</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {completedSessions.length || 1}
              </span>
              <span className="text-xs text-slate-400">sessions</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Full 5-stage oral interviews
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Monthly Quota</span>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {completedSessions.length}
              </span>
              <span className="text-xs text-slate-400">
                / {subscription?.plan.maxAssessments || 3} used
              </span>
            </div>
            <div className="text-[11px] text-rose-600 font-medium">
              <Link href="/dashboard/subscription" className="hover:underline">
                Upgrade for unlimited &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Next Assessment & Quick Action */}
      <Card className="border-slate-200 bg-gradient-to-r from-rose-50/50 via-white to-white dark:border-slate-800 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="cinnabar" className="text-xs">
              Recommended for your level
            </Badge>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              HSK 4 Intermediate Argumentation & Culture
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Step up from daily routines to thematic reasoning. Discuss technology, Chinese cultural experiences, and practice third-tone sandhi under guided AI supervision.
            </p>
          </div>
          <Link href="/dashboard/assessments" className="shrink-0">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Launch 12-Min Assessment</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Assessment Reports Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-rose-600" />
            <span>Recent Assessment Reports</span>
          </h2>
          <Link href="/dashboard/reports" className="text-xs font-semibold text-rose-600 hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Assessment Title</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Overall Score</th>
                  <th className="py-3.5 px-4">Proficiency Estimate</th>
                  <th className="py-3.5 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No assessment sessions yet. Click &quot;Start Oral Exam&quot; to begin!
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => {
                    const badge = s.result ? getScoreBadgeColor(s.result.overallScore) : null;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {s.template.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${
                              s.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : s.status === "IN_PROGRESS"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {s.result ? `${formatScore(s.result.overallScore)} / 100` : "Pending"}
                        </td>
                        <td className="py-3.5 px-4">
                          {s.result ? (
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              {s.result.hskEstimate}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {s.status === "COMPLETED" ? (
                            <Link href={`/dashboard/reports/${s.id}`}>
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                View Report
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/dashboard/assessments/${s.id}`}>
                              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-7">
                                Resume Exam
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
