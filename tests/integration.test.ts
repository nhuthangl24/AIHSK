import { describe, it, expect, beforeAll } from "vitest";
import prisma from "../src/lib/db/prisma";
import { AssessmentService } from "../src/services/assessment-service";
import { ScoringWorker } from "../src/lib/queue/scoring-worker";
import { SessionStatus } from "@prisma/client";

describe("Assessment Lifecycle Integration Tests", () => {
  let testUserId: string;
  let testTemplateId: string;
  let createdSessionId: string;

  beforeAll(async () => {
    // Retrieve test learner and template from seeded database
    const user = await prisma.user.findFirst({
      where: { email: "learner@aihsk.com" },
    });
    if (!user) throw new Error("Seeded learner not found");
    testUserId = user.id;

    const template = await prisma.assessmentTemplate.findFirst({
      where: { slug: "hsk-3-oral-proficiency" },
    });
    if (!template) throw new Error("Seeded template not found");
    testTemplateId = template.id;
  });

  it("should create and start a new assessment session with turn 0 examiner greeting", async () => {
    const session = await AssessmentService.startSession(testUserId, testTemplateId);
    expect(session).toBeDefined();
    expect(session.status).toBe(SessionStatus.IN_PROGRESS);
    expect(session.currentStage).toBe(1);
    createdSessionId = session.id;

    const turns = await prisma.conversationTurn.findMany({
      where: { sessionId: session.id },
      orderBy: { turnIndex: "asc" },
    });

    expect(turns).toHaveLength(1);
    expect(turns[0].speaker).toBe("EXAMINER");
    expect(turns[0].textContent).toContain("你好");
  });

  it("should process a learner turn and generate an examiner reply", async () => {
    const turnResult = await AssessmentService.submitLearnerTurn(
      createdSessionId,
      testUserId,
      "你好老师，我准备好了，我叫小明，来自美国。",
      undefined,
      10000
    );

    expect(turnResult.learnerTurn).toBeDefined();
    expect(turnResult.examinerTurn).toBeDefined();
    expect(turnResult.examinerTurn?.speaker).toBe("EXAMINER");

    const session = await prisma.assessmentSession.findUnique({
      where: { id: createdSessionId },
    });
    expect(session?.currentTurn).toBeGreaterThanOrEqual(2);
  });

  it("should trigger scoring pipeline and persist comprehensive report with dimensions and recommendations", async () => {
    // Simulate finishing all turns
    await prisma.assessmentSession.update({
      where: { id: createdSessionId },
      data: { status: SessionStatus.PROCESSING },
    });

    const jobId = await ScoringWorker.enqueueScoringJob(createdSessionId);
    expect(jobId).toBeDefined();

    // Process job
    await ScoringWorker.processJob(jobId);

    const updatedSession = await prisma.assessmentSession.findUnique({
      where: { id: createdSessionId },
      include: {
        result: {
          include: {
            scoreDimensions: true,
            recommendations: true,
          },
        },
      },
    });

    expect(updatedSession?.status).toBe(SessionStatus.COMPLETED);
    expect(updatedSession?.result).toBeDefined();
    expect(updatedSession?.result?.overallScore).toBeGreaterThan(0);
    expect(updatedSession?.result?.scoreDimensions.length).toBe(7);
    expect(updatedSession?.result?.recommendations.length).toBeGreaterThan(0);
  });

  it("should create assessment session for a synthetic Firebase or newly registered userId without FK constraint error", async () => {
    const syntheticUid = `firebase_test_user_${Date.now()}`;
    const session = await AssessmentService.startSession(syntheticUid, testTemplateId);
    expect(session).toBeDefined();
    expect(session.status).toBe(SessionStatus.IN_PROGRESS);
    expect(session.userId).toBe(syntheticUid);

    // Clean up
    await prisma.conversationTurn.deleteMany({ where: { sessionId: session.id } });
    await prisma.assessmentSession.delete({ where: { id: session.id } });
    await prisma.userProfile.deleteMany({ where: { userId: session.userId } });
    await prisma.user.delete({ where: { id: session.userId } });
  });
});
