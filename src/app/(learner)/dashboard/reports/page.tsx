import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, Award, Clock } from "lucide-react";
import { formatDate, formatScore, getScoreBadgeColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsListPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const sessions = await prisma.assessmentSession.findMany({
    where: {
      userId: user.userId,
      status: "COMPLETED",
    },
    include: {
      template: true,
      result: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Oral Assessment Reports
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Review your complete historical examination reports, 7-dimension linguistic scores, and weekly improvement plans.
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 text-center p-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No completed assessments yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Take your first 5-stage spoken interview with AI Examiner Li to receive an in-depth diagnostic report.
          </p>
          <Link href="/dashboard/assessments">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Start Assessment Free &rarr;
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((s) => {
            const score = s.result?.overallScore || 0;
            const badge = getScoreBadgeColor(score);

            return (
              <Card
                key={s.id}
                className="border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-900 transition-all shadow-sm"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatDate(s.createdAt)}
                    </span>
                    <Badge variant="cinnabar" className="text-[10px]">
                      {s.result?.hskEstimate || "HSK Diagnostic"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {s.template.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      CEFR Level: <span className="font-semibold text-slate-700 dark:text-slate-300">{s.result?.cefrEstimate || "B1"}</span>
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {formatScore(score)}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <span className="text-xs text-emerald-600 font-semibold ml-auto flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> High Confidence
                    </span>
                  </div>

                  <Link href={`/dashboard/reports/${s.id}`} className="block pt-2">
                    <Button variant="outline" className="w-full text-xs font-semibold flex items-center justify-center gap-2">
                      <span>View Full Diagnostic Report</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
