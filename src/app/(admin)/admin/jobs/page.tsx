import { assessmentStore } from "@/lib/db/assessment-store";
import { AIClient } from "@/lib/ai/ai-client";
import { JobsClient } from "./jobs-client";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const mem = process.memoryUsage();
  const heapUsedMb = Math.round(mem.heapUsed / (1024 * 1024));
  const heapTotalMb = Math.round(mem.heapTotal / (1024 * 1024));
  const rssMb = Math.round(mem.rss / (1024 * 1024));

  const storageStats = assessmentStore.getDiskStorageStats();
  const allSessions = assessmentStore.getAllSessions();
  const inProgressSessions = allSessions.filter((s) => s.status === "IN_PROGRESS");
  const activeAI = await AIClient.getActiveConfig().catch(() => null);

  const initialHealth = {
    status: "HEALTHY",
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      heapUsedMb,
      heapTotalMb,
      rssMb,
      percent: Math.round((heapUsedMb / Math.max(1, heapTotalMb)) * 100),
    },
    storage: storageStats,
    activeAI: activeAI
      ? {
          provider: activeAI.providerName,
          model: activeAI.modelId,
          enabled: activeAI.isEnabled,
        }
      : null,
  };

  const initialJobs = [
    ...inProgressSessions.map((s) => ({
      id: `job-eval-${s.id.substring(0, 8)}`,
      jobType: "AI Examiner Live Session",
      target: s.userEmail || s.userId,
      status: "IN_PROGRESS",
      latencyMs: 180,
      retries: 0,
      createdAt: s.startedAt || s.createdAt,
    })),
    ...allSessions.slice(0, 6).map((s) => ({
      id: `job-score-${s.id.substring(0, 8)}`,
      jobType: "Psychometric 7-Dimension Scoring",
      target: `HSKK ${s.template?.targetLevel || "Diagnostic"}`,
      status: s.status === "COMPLETED" ? "COMPLETED" : s.status === "FAILED" ? "FAILED" : "PROCESSING",
      latencyMs: s.status === "COMPLETED" ? 1420 : 0,
      retries: 0,
      createdAt: s.completedAt || s.createdAt,
    })),
  ];

  return <JobsClient initialHealth={initialHealth} initialJobs={initialJobs} />;
}
