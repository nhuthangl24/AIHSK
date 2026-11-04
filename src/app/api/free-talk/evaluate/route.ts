import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FreeTalkService, FREE_TALK_PERSONAS } from "@/lib/ai/free-talk-service";
import { assessmentStore } from "@/lib/db/assessment-store";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { messages, level, personaId } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Danh sách tin nhắn hợp lệ là bắt buộc." },
        { status: 400 }
      );
    }

    const persona = FREE_TALK_PERSONAS[personaId] || FREE_TALK_PERSONAS.friendly_peer;

    // 1. Run evaluation
    const evaluation = await FreeTalkService.evaluateSession({
      messages,
      level: level || "Tự do",
      personaId: personaId || "friendly_peer",
    });

    // 2. Persist to session store so it links to learning reports
    const sessionId = `freetalk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const userTurns = messages.map((m, i) => ({
      id: `turn-${sessionId}-${i}`,
      sessionId,
      turnIndex: i,
      stage: 1,
      speaker: m.role === "user" ? ("LEARNER" as const) : ("EXAMINER" as const),
      textContent: m.content,
      pinyinContent: m.pinyin || null,
      createdAt: new Date().toISOString(),
    }));

    const cefr =
      evaluation.hskEstimate === "HSK 1"
        ? "A1"
        : evaluation.hskEstimate === "HSK 2"
        ? "A2"
        : evaluation.hskEstimate === "HSK 3"
        ? "B1"
        : evaluation.hskEstimate === "HSK 4"
        ? "B2"
        : "C1";

    const storedResult = {
      id: `res-${sessionId}`,
      sessionId,
      overallScore: evaluation.overallScore,
      hskLevel: evaluation.hskEstimate,
      cefrLevel: cefr,
      passingStatus: evaluation.overallScore >= 60,
      feedbackSummary: evaluation.summary,
      scoringRationale:
        evaluation.strengths.join(". ") +
        (evaluation.improvements.length ? ". Cần cải thiện: " + evaluation.improvements.join(". ") : ""),
      scoredAt: new Date().toISOString(),
      scoreDimensions: [
        {
          id: `dim-${sessionId}-1`,
          dimensionName: "Độ Lưu Loát & Phản Xạ (Fluency)",
          score: evaluation.fluencyScore,
          weight: 0.35,
          feedback: "Độ trôi chảy, tốc độ phản xạ và tính liền mạch khi đối đáp.",
        },
        {
          id: `dim-${sessionId}-2`,
          dimensionName: "Ngữ Pháp & Cấu Trúc (Grammar)",
          score: evaluation.grammarScore,
          weight: 0.35,
          feedback: "Trật tự câu, trợ từ và độ chuẩn ngữ pháp tiếng Trung.",
        },
        {
          id: `dim-${sessionId}-3`,
          dimensionName: "Vốn Từ Vựng (Vocabulary)",
          score: evaluation.vocabularyScore,
          weight: 0.3,
          feedback: "Độ phong phú từ vựng và diễn đạt tự nhiên.",
        },
      ],
      recommendations: evaluation.corrections.map((corr, idx) => ({
        id: `rec-${sessionId}-${idx}`,
        category: "Sửa lỗi bản xứ",
        priority: idx + 1,
        recommendation: `Thay vì nói "${corr.original}", bạn nên dùng: "${corr.correction}"`,
        actionableExercise: corr.explanation,
      })),
    };

    assessmentStore.saveSession({
      id: sessionId,
      assignmentId: null,
      templateId: "tpl-freetalk",
      rubricId: null,
      userId: user.userId,
      status: "COMPLETED",
      currentStage: 1,
      currentTurn: messages.length,
      totalTurns: messages.length,
      totalDurationSeconds: Math.max(30, messages.length * 15),
      startedAt: new Date(Date.now() - messages.length * 15000).toISOString(),
      completedAt: new Date().toISOString(),
      failureReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template: {
        id: "tpl-freetalk",
        title: `Trò Chuyện Tự Do (${persona.name})`,
        slug: "free-talk",
        description: `Buổi trò chuyện tự do không gò bó cùng ${persona.name}.`,
        category: "FREE_TALK",
        targetLevel: level || "HSK 2",
        estimatedDurationMinutes: 10,
        maxTurns: 30,
        stagesConfig: [],
        examinerPrompt: "",
        rubricId: null,
        isActive: true,
        isPublic: true,
        createdById: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      turns: userTurns,
      result: storedResult,
    });

    // Best-effort database sync if Prisma is connected
    try {
      if (prisma) {
        // Find or create template in DB
        let dbTemplate = await prisma.assessmentTemplate.findFirst({
          where: { slug: "free-talk" },
        });
        if (!dbTemplate) {
          dbTemplate = await prisma.assessmentTemplate.create({
            data: {
              title: `Trò Chuyện Tự Do (${persona.name})`,
              slug: "free-talk",
              description: `Buổi trò chuyện tự do không gò bó cùng ${persona.name}.`,
              category: "HSK_ORIENTED",
              targetLevel: level || "HSK 2",
              estimatedDurationMinutes: 10,
              maxTurns: 30,
              stagesConfig: [],
              examinerPrompt: "Casual conversation partner",
            },
          });
        }

        await prisma.assessmentSession.create({
          data: {
            id: sessionId,
            templateId: dbTemplate.id,
            userId: user.userId,
            status: "COMPLETED",
            currentStage: 1,
            currentTurn: messages.length,
            totalTurns: messages.length,
            totalDurationSeconds: Math.max(30, messages.length * 15),
            completedAt: new Date(),
            result: {
              create: {
                overallScore: evaluation.overallScore,
                hskEstimate: evaluation.hskEstimate,
                cefrEstimate: cefr,
                performanceSummary: evaluation.summary,
                strengthsJson: evaluation.strengths || [],
                weaknessesJson: evaluation.improvements || [],
                priorityAreasJson: [],
                improvementPlanJson: [],
              },
            },
          },
        });
      }
    } catch {
      // Prisma offline, assessmentStore is primary backup
    }

    return NextResponse.json({
      success: true,
      sessionId,
      evaluation,
    });
  } catch (err: any) {
    console.error("Free Talk Evaluation API error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể hoàn thành chấm điểm buổi trò chuyện." },
      { status: 500 }
    );
  }
}
