import { describe, it, expect } from "vitest";
import { ExaminerService, STAGES_CONFIG } from "../src/lib/ai/examiner-service";
import { ConversationTurnItem } from "../src/lib/ai/types";

describe("Examiner 5-Stage Orchestration Unit Tests", () => {
  it("should have all 5 defined stages configured", () => {
    expect(STAGES_CONFIG).toHaveLength(5);
    expect(STAGES_CONFIG[0].stage).toBe(1);
    expect(STAGES_CONFIG[4].stage).toBe(5);
  });

  it("should greet candidate on turn 0", async () => {
    const turns: ConversationTurnItem[] = [];
    const nextTurn = await ExaminerService.generateNextTurn(turns, "HSK 3");

    expect(nextTurn.stage).toBe(1);
    expect(nextTurn.examinerResponse).toContain("你好");
    expect(nextTurn.isCompleted).toBe(false);
  });

  it("should progress through stages as learner responds", async () => {
    const turns: ConversationTurnItem[] = [
      { turnIndex: 0, stage: 1, speaker: "EXAMINER", textContent: "你好！请先自我介绍。" },
      { turnIndex: 1, stage: 1, speaker: "LEARNER", textContent: "老师好，我叫小明。" },
      { turnIndex: 2, stage: 1, speaker: "EXAMINER", textContent: "你学中文多久了？" },
      { turnIndex: 3, stage: 1, speaker: "LEARNER", textContent: "我学了一年了。" },
    ];

    const nextTurn = await ExaminerService.generateNextTurn(turns, "HSK 3");
    // After 2 learner turns, should transition to Stage 2
    expect(nextTurn.stage).toBe(2);
    expect(nextTurn.isCompleted).toBe(false);
  });

  it("should finalize and mark complete on stage 5 conclusion", async () => {
    // 12 learner turns: 2 (stage 1) + 3 (stage 2) + 3 (stage 3) + 3 (stage 4) + 1 (stage 5)
    const turns: ConversationTurnItem[] = [
      { turnIndex: 0, stage: 1, speaker: "EXAMINER", textContent: "Q1" },
      { turnIndex: 1, stage: 1, speaker: "LEARNER", textContent: "A1" },
      { turnIndex: 2, stage: 1, speaker: "EXAMINER", textContent: "Q2" },
      { turnIndex: 3, stage: 1, speaker: "LEARNER", textContent: "A2" },
      { turnIndex: 4, stage: 2, speaker: "EXAMINER", textContent: "Q3" },
      { turnIndex: 5, stage: 2, speaker: "LEARNER", textContent: "A3" },
      { turnIndex: 6, stage: 2, speaker: "EXAMINER", textContent: "Q4" },
      { turnIndex: 7, stage: 2, speaker: "LEARNER", textContent: "A4" },
      { turnIndex: 8, stage: 2, speaker: "EXAMINER", textContent: "Q5" },
      { turnIndex: 9, stage: 2, speaker: "LEARNER", textContent: "A5" },
      { turnIndex: 10, stage: 3, speaker: "EXAMINER", textContent: "Q6" },
      { turnIndex: 11, stage: 3, speaker: "LEARNER", textContent: "A6" },
      { turnIndex: 12, stage: 3, speaker: "EXAMINER", textContent: "Q7" },
      { turnIndex: 13, stage: 3, speaker: "LEARNER", textContent: "A7" },
      { turnIndex: 14, stage: 3, speaker: "EXAMINER", textContent: "Q8" },
      { turnIndex: 15, stage: 3, speaker: "LEARNER", textContent: "A8" },
      { turnIndex: 16, stage: 4, speaker: "EXAMINER", textContent: "Q9" },
      { turnIndex: 17, stage: 4, speaker: "LEARNER", textContent: "A9" },
      { turnIndex: 18, stage: 4, speaker: "EXAMINER", textContent: "Q10" },
      { turnIndex: 19, stage: 4, speaker: "LEARNER", textContent: "A10" },
      { turnIndex: 20, stage: 4, speaker: "EXAMINER", textContent: "Q11" },
      { turnIndex: 21, stage: 4, speaker: "LEARNER", textContent: "A11" },
      { turnIndex: 22, stage: 5, speaker: "EXAMINER", textContent: "Q12" },
      { turnIndex: 23, stage: 5, speaker: "LEARNER", textContent: "A12" },
    ];

    const nextTurn = await ExaminerService.generateNextTurn(turns, "HSK 4");
    expect(nextTurn.stage).toBe(5);
    expect(nextTurn.isCompleted).toBe(true);
    expect(nextTurn.examinerResponse).toContain("结束");
  });

  it("should self-heal and process turn with sessionSnapshot when session was not in store (serverless cold-start simulation)", async () => {
    const { AssessmentService } = await import("../src/services/assessment-service");
    const { assessmentStore } = await import("../src/lib/db/assessment-store");

    const coldSessionId = `session_cold_${Date.now()}_abc123`;
    expect(assessmentStore.getSession(coldSessionId)).toBeNull();

    const result = await AssessmentService.submitLearnerTurn(
      coldSessionId,
      "test_user",
      "老师，我想去日本桥旅游。",
      undefined,
      5000,
      {
        id: coldSessionId,
        templateId: "tpl-hsk3",
        currentStage: 3,
        currentTurn: 4,
        turns: [
          { turnIndex: 0, stage: 1, speaker: "EXAMINER", textContent: "你好！" },
          { turnIndex: 1, stage: 1, speaker: "LEARNER", textContent: "你好老师！" },
        ],
        template: {
          id: "tpl-hsk3",
          title: "Du lịch, Đặt phòng & Hỏi đường",
          targetLevel: "HSK 3",
        },
      }
    );

    expect(result).toBeDefined();
    expect(result.examinerTurn).toBeDefined();
    expect(result.examinerTurn?.textContent).toBeTruthy();

    const restored = assessmentStore.getSession(coldSessionId);
    expect(restored).not.toBeNull();
    expect(restored?.id).toBe(coldSessionId);
    expect(restored?.template?.title).toBe("Du lịch, Đặt phòng & Hỏi đường");
  });

  it("should match user sessions across Google MD5 hash, email, and userEmail fields", async () => {
    const { AssessmentService } = await import("../src/services/assessment-service");
    const { assessmentStore } = await import("../src/lib/db/assessment-store");
    const crypto = await import("crypto");

    const email = "learner.sync@test.com";
    const googleHash = crypto.createHash("md5").update(email).digest("hex").slice(0, 16);
    const googleUserId = `google_${googleHash}`;

    // Start a session with Google ID and email
    const session = await AssessmentService.startSession(googleUserId, "tpl-hsk3", undefined, email);
    expect(session.userEmail).toBe(email);

    // Query with classnia ID and email
    const classniaId = `classnia_learner_sync_test_com`;
    const userSessions = await AssessmentService.getUserSessions(classniaId, email);

    const found = userSessions.find((s) => s.id === session.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(session.id);
  });
});
