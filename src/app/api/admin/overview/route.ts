import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";
import { AIClient } from "@/lib/ai/ai-client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const [
    userCount,
    assessmentCount,
    completedCount,
    failedCount,
    templates,
    recentJobs,
    recentAudits,
    recentUsers,
    activeAI,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.assessmentSession.count(),
    prisma.assessmentSession.count({ where: { status: "COMPLETED" } }),
    prisma.assessmentSession.count({ where: { status: "FAILED" } }),
    prisma.assessmentTemplate.findMany(),
    prisma.backgroundJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { email: true, name: true } } },
    }),
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
    }),
    AIClient.getActiveConfig(),
  ]);

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
