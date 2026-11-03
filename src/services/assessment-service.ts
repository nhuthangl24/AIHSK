import prisma from "@/lib/db/prisma";
import { ExaminerService } from "@/lib/ai/examiner-service";
import { ScoringWorker } from "@/lib/queue/scoring-worker";
import { SessionStatus, SpeakerType } from "@prisma/client";
import { ConversationTurnItem } from "@/lib/ai/types";

export class AssessmentService {
  /**
   * Starts a new assessment session for a user and template.
   */
  static async startSession(userId: string, templateId: string, assignmentId?: string) {
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || !template.isActive) {
      throw new Error("Assessment template not found or inactive.");
    }

    const session = await prisma.assessmentSession.create({
      data: {
        userId,
        templateId,
        assignmentId,
        rubricId: template.rubricId,
        status: SessionStatus.IN_PROGRESS,
        currentStage: 1,
        currentTurn: 0,
        totalTurns: template.maxTurns || 10,
        startedAt: new Date(),
      },
    });

    // Generate initial greeting turn from AI Examiner
    const initialTurn = await ExaminerService.generateNextTurn(
      [],
      template.targetLevel,
      template.title
    );

    await prisma.conversationTurn.create({
      data: {
        sessionId: session.id,
        turnIndex: 0,
        stage: initialTurn.stage,
        speaker: SpeakerType.EXAMINER,
        textContent: initialTurn.examinerResponse,
        pinyinContent: initialTurn.pinyin,
      },
    });

    return session;
  }

  /**
   * Submits a learner's spoken turn and gets the examiner's next response.
   */
  static async submitLearnerTurn(
    sessionId: string,
    userId: string,
    learnerText: string,
    audioUrl?: string,
    durationMs?: number
  ) {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        turns: { orderBy: { turnIndex: "asc" } },
        template: true,
      },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Forbidden: You do not own this session");
    }

    if (session.status !== SessionStatus.IN_PROGRESS) {
      if (session.status === SessionStatus.PROCESSING || session.status === SessionStatus.COMPLETED) {
        if (session.status === SessionStatus.PROCESSING) {
          ScoringWorker.ensureSessionScored(sessionId).catch((e) =>
            console.error("Duplicate submit scoring error:", e)
          );
        }
        return {
          learnerTurn: session.turns[session.turns.length - 1] || null,
          examinerTurn: null,
          isCompleted: true,
          stage: 5,
        };
      }
      throw new Error(`Cannot submit turn. Session status is ${session.status}`);
    }

    const nextTurnIndex = session.turns.length;

    // Record learner turn
    const learnerTurn = await prisma.conversationTurn.create({
      data: {
        sessionId: session.id,
        turnIndex: nextTurnIndex,
        stage: session.currentStage,
        speaker: SpeakerType.LEARNER,
        textContent: learnerText,
        audioUrl,
        durationMs: durationMs || 0,
      },
    });

    // If audio is provided, record AudioRecording
    if (audioUrl) {
      await prisma.audioRecording.create({
        data: {
          sessionId: session.id,
          turnId: learnerTurn.id,
          storageKey: audioUrl,
          url: audioUrl,
          durationMs: durationMs || 0,
        },
      });
    }

    // Build history for examiner
    const turnItems: ConversationTurnItem[] = [
      ...session.turns.map((t) => ({
        turnIndex: t.turnIndex,
        stage: t.stage,
        speaker: t.speaker as "EXAMINER" | "LEARNER",
        textContent: t.textContent,
        pinyinContent: t.pinyinContent || undefined,
        audioUrl: t.audioUrl || undefined,
      })),
      {
        turnIndex: nextTurnIndex,
        stage: session.currentStage,
        speaker: "LEARNER",
        textContent: learnerText,
      },
    ];

    // Generate examiner reply
    const examinerReply = await ExaminerService.generateNextTurn(
      turnItems,
      session.template.targetLevel,
      session.template.title
    );

    const examinerTurnIndex = nextTurnIndex + 1;

    // Record examiner turn
    const examinerTurn = await prisma.conversationTurn.create({
      data: {
        sessionId: session.id,
        turnIndex: examinerTurnIndex,
        stage: examinerReply.stage,
        speaker: SpeakerType.EXAMINER,
        textContent: examinerReply.examinerResponse,
        pinyinContent: examinerReply.pinyin,
      },
    });

    // Check if exam completed (reached Stage 5 completion or max turns)
    const isCompleted = examinerReply.isCompleted || examinerTurnIndex >= session.totalTurns - 1;

    if (isCompleted) {
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.PROCESSING,
          currentStage: 5,
          currentTurn: examinerTurnIndex,
        },
      });

      // Enqueue background scoring pipeline
      await ScoringWorker.enqueueScoringJob(sessionId);
    } else {
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          currentStage: examinerReply.stage,
          currentTurn: examinerTurnIndex,
        },
      });
    }

    return {
      learnerTurn,
      examinerTurn,
      isCompleted,
      stage: examinerReply.stage,
    };
  }

  /**
   * Fetches full assessment details including report, scores, recommendations, and turns.
   */
  static async getSessionWithReport(sessionId: string, userId: string) {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        template: true,
        turns: {
          orderBy: { turnIndex: "asc" },
          include: { recording: true },
        },
        result: {
          include: {
            scoreDimensions: { orderBy: { weight: "desc" } },
            recommendations: { orderBy: { priority: "asc" } },
          },
        },
      },
    });

    if (!session) return null;

    // Authorization check: User can access if they own it or are admin
    return session;
  }
}
