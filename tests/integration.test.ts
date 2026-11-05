import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AssessmentService } from "../src/services/assessment-service";
import { ScoringWorker } from "../src/lib/queue/scoring-worker";
import { assessmentStore } from "../src/lib/db/assessment-store";
import { SessionStatus } from "../src/types/database";

describe("Assessment Lifecycle Integration Tests (Firebase & Store)", () => {
  let testUserId: string;
  let testTemplateId: string;
  let createdSessionId: string;
  let secondSessionId: string;

  beforeAll(async () => {
    testUserId = `integration_user_${Date.now()}`;
    const templates = await AssessmentService.getTemplates();
    const template = templates.find((t) => t.slug === "hsk-3-speaking-intermediate") || templates[0];
    if (!template) throw new Error("Default template not found");
    testTemplateId = template.id;
  });

  afterAll(() => {
    if (createdSessionId) {
      delete (assessmentStore as any).data.sessions[createdSessionId];
    }
    if (secondSessionId) {
      delete (assessmentStore as any).data.sessions[secondSessionId];
    }
  });

  it("should create and start a new assessment session with turn 0 examiner greeting", async () => {
    const session = await AssessmentService.startSession(testUserId, testTemplateId);
    expect(session).toBeDefined();
    expect(session.status).toBe(SessionStatus.IN_PROGRESS);
    expect(session.currentStage).toBe(1);
    createdSessionId = session.id;

    const storedSession = assessmentStore.getSession(session.id);
    expect(storedSession).toBeDefined();
    expect(storedSession?.turns).toHaveLength(1);
    expect(storedSession?.turns[0].speaker).toBe("EXAMINER");
    expect(storedSession?.turns[0].textContent).toBeDefined();
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

    const session = assessmentStore.getSession(createdSessionId);
    expect(session?.currentTurn).toBeGreaterThanOrEqual(2);
  });

  it("should trigger scoring pipeline and persist comprehensive report with dimensions and recommendations", async () => {
    // Process scoring
    await ScoringWorker.processSession(createdSessionId);

    const updatedSession = await AssessmentService.getSessionWithReport(createdSessionId, testUserId);

    expect(updatedSession?.status).toBe(SessionStatus.COMPLETED);
    expect(updatedSession?.result).toBeDefined();
    expect(updatedSession?.result?.overallScore).toBeGreaterThan(0);
    expect(updatedSession?.result?.scoreDimensions.length).toBe(7);
    expect(updatedSession?.result?.recommendations.length).toBeGreaterThan(0);
  });

  it("should create assessment session for a synthetic Firebase or newly registered userId", async () => {
    const syntheticUid = `firebase_test_user_${Date.now()}`;
    const session = await AssessmentService.startSession(syntheticUid, testTemplateId);
    secondSessionId = session.id;
    expect(session).toBeDefined();
    expect(session.status).toBe(SessionStatus.IN_PROGRESS);
    expect(session.userId).toBe(syntheticUid);
  });
});
