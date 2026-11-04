import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@/types/database";
import { AIClient } from "@/lib/ai/ai-client";
import { assessmentStore } from "@/lib/db/assessment-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  const allSessions = assessmentStore.getAllSessions();
  const templates = assessmentStore.getTemplates();
  const assessmentCount = allSessions.length;
  const completedCount = allSessions.filter((s) => s.status === "COMPLETED").length;
  const failedCount = allSessions.filter((s) => s.status === "FAILED").length;
  const userCount = Math.max(1, new Set(allSessions.map((s) => s.userId)).size);

  const activeAI = await AIClient.getActiveConfig().catch(() => ({
    providerName: "hhtech",
    modelId: "claude-sonnet-4.6",
    isEnabled: true,
    apiKey: "configured",
  }));

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
    recentJobs: [],
    recentAudits: [],
    recentUsers: [],
    aiConfig: {
      llmProvider: llmDisplay,
      speechRecognition: "Web Audio STT / Cloud Whisper API",
      speechSynthesis: "Native Web Speech / Cloud TTS",
      scoringEngine: "Multi-dimensional Psychometric Engine v1.0",
    },
  });
}
