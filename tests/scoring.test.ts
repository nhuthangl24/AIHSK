import { describe, it, expect } from "vitest";
import { ScoringEngine, ScoringReportSchema } from "../src/lib/ai/scoring-engine";
import { ConversationTurnItem } from "../src/lib/ai/types";

describe("AI Scoring Engine Unit Tests", () => {
  it("should accurately evaluate a complete 5-stage conversation transcript", () => {
    const mockTurns: ConversationTurnItem[] = [
      {
        turnIndex: 0,
        stage: 1,
        speaker: "EXAMINER",
        textContent: "你好！请先用中文简单介绍一下你自己吧。",
      },
      {
        turnIndex: 1,
        stage: 1,
        speaker: "LEARNER",
        textContent: "老师好，我叫陈明，学习中文两年了。我非常喜欢中国历史和中国美食。",
      },
      {
        turnIndex: 2,
        stage: 2,
        speaker: "EXAMINER",
        textContent: "在周末或者空闲时间，你一般喜欢做些什么？",
      },
      {
        turnIndex: 3,
        stage: 2,
        speaker: "LEARNER",
        textContent: "我平时喜欢打篮球，因为有中文字幕，所以我也喜欢看电视剧提高听力。",
      },
      {
        turnIndex: 4,
        stage: 3,
        speaker: "EXAMINER",
        textContent: "你认为利用人工智能学习中文有什么优势？它是否可以完全代替传统的老师呢？",
      },
      {
        turnIndex: 5,
        stage: 3,
        speaker: "LEARNER",
        textContent: "虽然科技非常方便，但是我认为它不能完全代替老师，因为真正的老师可以有情感交流，能提出针对性的建议。",
      },
    ];

    const report = ScoringEngine.evaluateLinguistically(mockTurns, "HSK 4");

    // Check schema validation
    const parsed = ScoringReportSchema.safeParse(report);
    expect(parsed.success).toBe(true);

    // Verify overall score bounds
    expect(report.overallScore).toBeGreaterThanOrEqual(60);
    expect(report.overallScore).toBeLessThanOrEqual(100);

    // Verify all 7 dimensions are present
    expect(report.dimensions).toHaveLength(7);
    const keys = report.dimensions.map((d) => d.key);
    expect(keys).toContain("pronunciation");
    expect(keys).toContain("fluency");
    expect(keys).toContain("vocabulary");
    expect(keys).toContain("grammar");
    expect(keys).toContain("coherence");
    expect(keys).toContain("comprehension");
    expect(keys).toContain("interaction");

    // Verify evidence quotes are grounded in real transcript text
    expect(report.dimensions[0].evidenceQuotes.length).toBeGreaterThan(0);

    // Verify grammar corrections are structured
    expect(report.grammarCorrections.length).toBeGreaterThan(0);
    expect(report.grammarCorrections[0]).toHaveProperty("original");
    expect(report.grammarCorrections[0]).toHaveProperty("corrected");
    expect(report.grammarCorrections[0]).toHaveProperty("explanation");

    // Verify weekly improvement roadmap
    expect(report.improvementPlan).toHaveLength(4);
    expect(report.improvementPlan[0].week).toBe(1);
  });

  it("should calculate correct weighted score total for elementary learner", () => {
    const mockTurns: ConversationTurnItem[] = [
      {
        turnIndex: 0,
        stage: 1,
        speaker: "EXAMINER",
        textContent: "你好，请开始。",
      },
      {
        turnIndex: 1,
        stage: 1,
        speaker: "LEARNER",
        textContent: "你好，我叫王小明，来自法国。",
      },
    ];

    const report = ScoringEngine.evaluateLinguistically(mockTurns, "HSK 2");
    expect(report.overallScore).toBeGreaterThan(0);
    expect(report.overallScore).toBeLessThan(60); // Elementary learner should not be inflated to high score
    expect(report.cefrEstimate).toBeDefined();
    expect(report.hskEstimate).toBeDefined();
  });

  it("should heavily penalize and flag candidate who copies examiner questions", () => {
    const copiedTurns: ConversationTurnItem[] = [
      {
        turnIndex: 0,
        stage: 1,
        speaker: "EXAMINER",
        textContent: "你好！欢迎参加今天的华语口语评估。请先用中文简单介绍一下你自己吧。",
      },
      {
        turnIndex: 1,
        stage: 1,
        speaker: "LEARNER",
        textContent: "你好！欢迎参加今天的华语口语评估。请先用中文简单介绍一下你自己吧。",
      },
      {
        turnIndex: 2,
        stage: 2,
        speaker: "EXAMINER",
        textContent: "请问你平时学习中文多长时间了？你觉得学中文最有趣的地方是什么？",
      },
      {
        turnIndex: 3,
        stage: 2,
        speaker: "LEARNER",
        textContent: "请问你平时学习中文多长时间了？你觉得学中文最有趣的地方是什么？",
      },
    ];

    const report = ScoringEngine.evaluateLinguistically(copiedTurns, "HSK 3");
    const parsed = ScoringReportSchema.safeParse(report);
    expect(parsed.success).toBe(true);

    // Score must be severely failed
    expect(report.overallScore).toBeLessThanOrEqual(25);
    expect(report.cefrEstimate).toBe("A1");
    expect(report.hskEstimate).toBe("HSK 1 (Unofficial)");

    // Summary must detect and explain the copying
    expect(report.performanceSummary.toLowerCase()).toContain("sao chép");
  });

  it("should heavily penalize and flag gibberish and non-Chinese answers", () => {
    const gibberishTurns: ConversationTurnItem[] = [
      {
        turnIndex: 0,
        stage: 1,
        speaker: "EXAMINER",
        textContent: "你好！请先用中文简单介绍一下你自己吧。",
      },
      {
        turnIndex: 1,
        stage: 1,
        speaker: "LEARNER",
        textContent: "asdfasdf 123 linh tinh haha test",
      },
      {
        turnIndex: 2,
        stage: 2,
        speaker: "EXAMINER",
        textContent: "在周末或者空闲时间，你一般喜欢做些什么？",
      },
      {
        turnIndex: 3,
        stage: 2,
        speaker: "LEARNER",
        textContent: "zzz xxx yyy khong biet noi gi dau a",
      },
    ];

    const report = ScoringEngine.evaluateLinguistically(gibberishTurns, "HSK 3");
    const parsed = ScoringReportSchema.safeParse(report);
    expect(parsed.success).toBe(true);

    // Score must be severely failed
    expect(report.overallScore).toBeLessThanOrEqual(20);
    expect(report.cefrEstimate).toBe("A1");
    expect(report.hskEstimate).toBe("HSK 1 (Unofficial)");

    // Summary must detect invalid/gibberish input
    expect(report.performanceSummary.toLowerCase()).toMatch(/linh tinh|ngẫu nhiên|không phải tiếng trung/);
  });
});
