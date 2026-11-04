import { NextResponse } from "next/server";
import { prisma, isPrismaAvailable } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { AIClient } from "@/lib/ai/ai-client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  let userCount = 0;
  let assessmentCount = 0;
  let completedCount = 0;
  let failedCount = 0;
  let templates: any[] = [];
  let recentJobs: any[] = [];
  let recentAudits: any[] = [];
  let recentUsers: any[] = [];
  let activeAI: any = { providerName: "hhtech", modelId: "claude-sonnet-4.6", isEnabled: true, apiKey: "configured" };

  try {
    if (await isPrismaAvailable()) {
      const [
        uCount,
        aCount,
        cCount,
        fCount,
        tpls,
        rJobs,
        rAudits,
        rUsers,
        aAI,
      ] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.assessmentSession.count().catch(() => 0),
        prisma.assessmentSession.count({ where: { status: "COMPLETED" } }).catch(() => 0),
        prisma.assessmentSession.count({ where: { status: "FAILED" } }).catch(() => 0),
        prisma.assessmentTemplate.findMany().catch(() => []),
        prisma.backgroundJob.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        }).catch(() => []),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { actor: { select: { email: true, name: true } } },
        }).catch(() => []),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        }).catch(() => []),
        AIClient.getActiveConfig().catch(() => activeAI),
      ]);

      userCount = uCount;
      assessmentCount = aCount;
      completedCount = cCount;
      failedCount = fCount;
      templates = tpls;
      recentJobs = rJobs;
      recentAudits = rAudits;
      recentUsers = rUsers;
      activeAI = aAI;
    } else {
      activeAI = await AIClient.getActiveConfig().catch(() => activeAI);
    }
  } catch {
    // Offline fallback
  }

  const llmDisplay = activeAI.apiKey && activeAI.isEnabled
    ? `${activeAI.providerName.toUpperCase()} (${activeAI.modelId})`
    : "Built-in Adaptive Neural Engine";

  return NextResponse.json({
    metrics: {
      totalUsers: userCount,
      totalAssessments: assessmentCount,
      completedAssessments: completedCount,
      failedAssessments: failedCount,
      completionRate: assessmentCount > 0 ? Math.round((completedCount / assessmentCount) * 100) : 100,
      systemHealth: "Operational",
    },
    templates,
    recentJobs,
    recentAudits,
    recentUsers,
    aiConfig: {
      llmProvider: llmDisplay,
      speechRecognition: "Web Audio STT / Cloud Whisper API",
      speechSynthesis: "Native Web Speech / Cloud TTS",
      scoringEngine: "Multi-dimensional Psychometric Engine v1.0",
    },
  });
}
