import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, BarChart2, CheckCircle2 } from "lucide-react";
import { formatScore, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearningProgressPage() {
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
      result: {
        include: {
          scoreDimensions: true,
        },
      },
      template: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Oral Proficiency Progress
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Track your longitudinal score improvements, tone stabilization, and vocabulary acquisition across all oral examination sessions.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Starting Benchmark
            </span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              72.0 <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500">HSK 3 Baseline (CEFR B1)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Highest Score
            </span>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-500">
              84.5 <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +12.5 Point Gain
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Proficiency Status
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              HSK 4 Intermediate
            </div>
            <p className="text-xs text-slate-500">Ready for HSK 5 Business Discourse</p>
          </CardContent>
        </Card>
      </div>

      {/* Dimension Trajectory Breakdown */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-rose-600" />
            <span>Multi-Dimension Mastery Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6">
          {[
            { name: "Pronunciation & 4-Tone Accuracy", score: 87.5, level: "Proficient", delta: "+8%" },
            { name: "Speech Rhythm & Fluency", score: 85.0, level: "Proficient", delta: "+15%" },
            { name: "Vocabulary Range & Diversity", score: 83.3, level: "Proficient", delta: "+10%" },
            { name: "Grammar & Connective Pairs", score: 86.6, level: "Proficient", delta: "+12%" },
            { name: "Logical Coherence & Discourse", score: 85.0, level: "Mastery", delta: "+5%" },
            { name: "Interactive Communication", score: 80.0, level: "Proficient", delta: "+18%" },
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                <span className="text-slate-500">
                  {item.score}% &bull;{" "}
                  <span className="text-emerald-600 font-bold">{item.delta}</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
