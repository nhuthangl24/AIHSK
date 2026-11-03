import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ error: "Forbidden: Platform Super Admin required" }, { status: 403 });
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
  ]);

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
      llmProvider: process.env.OPENAI_API_KEY ? "OpenAI GPT-4o-mini" : "Built-in Adaptive Neural Engine",
      speechRecognition: "Web Audio STT / Cloud Whisper API",
      speechSynthesis: "Native Web Speech / Cloud TTS",
      scoringEngine: "Multi-dimensional Psychometric Engine v1.0",
    },
  });
}
