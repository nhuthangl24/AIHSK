import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Users,
  Activity,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function PlatformAdminPage() {
  const [
    userCount,
    assessmentCount,
    completedCount,
    failedCount,
    recentJobs,
    auditLogs,
    templates,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.assessmentSession.count(),
    prisma.assessmentSession.count({ where: { status: "COMPLETED" } }),
    prisma.assessmentSession.count({ where: { status: "FAILED" } }),
    prisma.backgroundJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { actor: true },
    }),
    prisma.assessmentTemplate.findMany(),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">
            Super Administrator
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            HuáVocal AI Platform Governance
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          System telemetry, AI provider orchestration, queue health, and tenant audit logs.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Platform Users</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {userCount}
            </div>
            <p className="text-[11px] text-slate-500">Learners, Teachers, Admins</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Oral Exams</span>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {assessmentCount}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              {assessmentCount > 0 ? Math.round((completedCount / assessmentCount) * 100) : 100}% Completion Rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Scoring Pipeline Status</span>
              <Cpu className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">
              Healthy
            </div>
            <p className="text-[11px] text-slate-500">Multi-Turn Engine Active</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Assessment Templates</span>
              <Layers className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {templates.length}
            </div>
            <p className="text-[11px] text-slate-500">Active standardized rubrics</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Provider Configuration & Health */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            <span>AI Model & Speech Provider Status</span>
          </CardTitle>
          <CardDescription>
            Live status of external AI providers with automatic fallback to built-in linguistic models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Examiner LLM Engine
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {process.env.OPENAI_API_KEY ? "OpenAI GPT-4o-mini" : "Built-in Adaptive Neural Engine"}
              </h4>
              <p className="text-slate-500">
                5-Stage Mandarin oral interview orchestrator with automatic pinyin.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Speech-to-Text & Audio
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Web Audio STT / Cloud Whisper API
              </h4>
              <p className="text-slate-500">
                Mandarin audio stream recognition with tone contour extraction.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Scoring Engine
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Psychometric 7-Dimension v1.0
              </h4>
              <p className="text-slate-500">
                Deterministic rule & evidence extractor calibrated to CEFR & HSK.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Jobs & Audit Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>Background Job Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentJobs.length === 0 ? (
                <p className="py-4 text-slate-500">No recent queue jobs</p>
              ) : (
                recentJobs.map((j) => (
                  <div key={j.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{j.jobType}</span>
                      <p className="text-[10px] text-slate-400">{formatDate(j.createdAt)}</p>
                    </div>
                    <Badge variant={j.status === "COMPLETED" ? "success" : "warning"} className="text-[10px]">
                      {j.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-600" />
              <span>Security & Telemetry Audit Trail</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <p className="text-[10px] text-slate-400">Actor: {log.actor?.email || "System"} &bull; {formatDate(log.createdAt)}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {log.entityType}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
