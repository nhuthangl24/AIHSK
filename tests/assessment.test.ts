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
    const turns: ConversationTurnItem[] = [
      { turnIndex: 0, stage: 1, speaker: "EXAMINER", textContent: "Q1" },
      { turnIndex: 1, stage: 1, speaker: "LEARNER", textContent: "A1" },
      { turnIndex: 2, stage: 2, speaker: "EXAMINER", textContent: "Q2" },
      { turnIndex: 3, stage: 2, speaker: "LEARNER", textContent: "A2" },
      { turnIndex: 4, stage: 2, speaker: "EXAMINER", textContent: "Q3" },
      { turnIndex: 5, stage: 2, speaker: "LEARNER", textContent: "A3" },
      { turnIndex: 6, stage: 3, speaker: "EXAMINER", textContent: "Q4" },
      { turnIndex: 7, stage: 3, speaker: "LEARNER", textContent: "A4" },
      { turnIndex: 8, stage: 4, speaker: "EXAMINER", textContent: "Q5" },
      { turnIndex: 9, stage: 4, speaker: "LEARNER", textContent: "A5" },
      { turnIndex: 10, stage: 4, speaker: "EXAMINER", textContent: "Q6" },
      { turnIndex: 11, stage: 4, speaker: "LEARNER", textContent: "A6" },
      { turnIndex: 12, stage: 4, speaker: "EXAMINER", textContent: "Q7" },
      { turnIndex: 13, stage: 4, speaker: "LEARNER", textContent: "A7" },
      { turnIndex: 14, stage: 5, speaker: "EXAMINER", textContent: "Q8" },
      { turnIndex: 15, stage: 5, speaker: "LEARNER", textContent: "A8" },
      { turnIndex: 16, stage: 5, speaker: "EXAMINER", textContent: "Q9" },
      { turnIndex: 17, stage: 5, speaker: "LEARNER", textContent: "A9" },
    ];

    const nextTurn = await ExaminerService.generateNextTurn(turns, "HSK 4");
    expect(nextTurn.stage).toBe(5);
    expect(nextTurn.isCompleted).toBe(true);
    expect(nextTurn.examinerResponse).toContain("结束");
  });
});
