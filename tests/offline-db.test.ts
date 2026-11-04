import { describe, it, expect } from "vitest";
import { AssessmentService } from "../src/services/assessment-service";
import { ScoringWorker } from "../src/lib/queue/scoring-worker";
import { assessmentStore } from "../src/lib/db/assessment-store";

describe("Firebase & Local Store Mode (Zero-PostgreSQL) Resilience Tests", () => {
  const testUserId = `firebase_user_test_${Date.now()}`;
  let customTemplateId: string;
  let testSessionId: string;

  it("should create a custom assessment template without PostgreSQL/Prisma", async () => {
    const template = await AssessmentService.createCustomTemplate(
      "Đàm phán xuất nhập khẩu",
      "HSK 4",
      testUserId
    );

    expect(template).toBeDefined();
    expect(template.id).toBeDefined();
    expect(template.title).toBe("Đàm phán xuất nhập khẩu");
    expect(template.targetLevel).toBe("HSK 4");
    customTemplateId = template.id;

    // Verify template is retrievable via assessmentStore
    const retrieved = assessmentStore.getTemplate(customTemplateId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(customTemplateId);
  });

  it("should start an assessment session with turn 0 examiner greeting without PostgreSQL", async () => {
    const session = await AssessmentService.startSession(testUserId, customTemplateId);

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.status).toBe("IN_PROGRESS");
    expect(session.currentStage).toBe(1);
    const anySession = session as any;
    expect(anySession.turns).toBeDefined();
    expect(anySession.turns.length).toBe(1);
    expect(anySession.turns[0].speaker).toBe("EXAMINER");
    expect(anySession.turns[0].textContent).toBeDefined();

    testSessionId = session.id;
  });

  it("should submit a learner turn and receive an AI examiner response without PostgreSQL", async () => {
    const turnResult = await AssessmentService.submitLearnerTurn(
      testSessionId,
      testUserId,
      "你好考官，我准备好了，我想练习关于中越进出口贸易的谈判。"
    );

    expect(turnResult.learnerTurn).toBeDefined();
    expect(turnResult.learnerTurn?.speaker).toBe("LEARNER");
    expect(turnResult.examinerTurn).toBeDefined();
    expect(turnResult.examinerTurn?.speaker).toBe("EXAMINER");
    expect(turnResult.examinerTurn?.textContent).toBeDefined();

    const storedSession = assessmentStore.getSession(testSessionId);
    expect(storedSession?.turns.length).toBe(3); // Turn 0 (Examiner), Turn 1 (Learner), Turn 2 (Examiner)
  });

  it("should evaluate and finalize scoring report with 7 dimensions without PostgreSQL", async () => {
    await ScoringWorker.processSession(testSessionId);

    const sessionWithReport = await AssessmentService.getSessionWithReport(testSessionId, testUserId);
    expect(sessionWithReport).not.toBeNull();
    expect(sessionWithReport?.status).toBe("COMPLETED");
    expect(sessionWithReport?.result).toBeDefined();
    expect(sessionWithReport?.result?.overallScore).toBeGreaterThanOrEqual(0);
    expect(sessionWithReport?.result?.scoreDimensions.length).toBe(7);
    expect(sessionWithReport?.result?.recommendations.length).toBeGreaterThan(0);
    expect(sessionWithReport?.user).toBeDefined();
    expect(sessionWithReport?.user.name).toBeDefined();
  });

  it("should list user sessions and active templates without PostgreSQL", async () => {
    const sessions = await AssessmentService.getUserSessions(testUserId);
    expect(sessions.length).toBeGreaterThanOrEqual(1);
    expect(sessions[0].id).toBe(testSessionId);

    const templates = await AssessmentService.getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(1);
  });
});
