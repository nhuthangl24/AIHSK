import { describe, it, expect, vi, beforeEach } from "vitest";
import { HskkService, HSKK_TEMPLATES } from "@/lib/ai/hskk-service";
import { AIClient } from "@/lib/ai/ai-client";

describe("Native Multimodal Audio Evaluation (Approach 1 with Gemini 3.6 Flash)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should evaluate HSKK session and prioritize Gemini audio analysis when audioBase64 is present", async () => {
    // Mock evaluateAudioWithGemini
    const evaluateAudioSpy = vi
      .spyOn(AIClient, "evaluateAudioWithGemini")
      .mockResolvedValue(
        JSON.stringify({
          recognizedTranscript: "随着现代科技的快速发展，人们的交流方式变得越来越便利。",
          pinyinWithTones: "Suízhe xiàndài kējì de kuàisù fāzhǎn, rénmen de jiāoliú fāngshì biànde yuèláiyuè biànlì.",
          score: 3.0,
          pronunciationQuality: "EXCELLENT",
          tonesAccuracyScore: 96,
          fluencyScore: 92,
          phoneticsAnalysis: {
            tonesComment: "Thanh điệu chuẩn xác, biến điệu hai thanh 3 rất tự nhiên.",
            initialsAndFinalsComment: "Phụ âm uốn lưỡi sh và thanh mẫu b/p rõ ràng.",
            pauseAndFluencyComment: "Tốc độ nói vừa phải, lưu loát.",
          },
          feedbackVi: "Phát âm rất tốt, ngữ điệu tự nhiên.",
          correction: "随着现代科技的快速发展，人们的交流方式变得越来越便利。",
          pinyinCorrection: "Suízhe xiàndài kējì de kuàisù fāzhǎn, rénmen de jiāoliú fāngshì biànde yuèláiyuè biànlì.",
        })
      );

    const session = HskkService.createSession({
      userId: "test_audio_user",
      templateId: "hskk-intermediate-std-1",
      mode: "OFFICIAL",
    });

    const template = HskkService.getTemplateById("hskk-intermediate-std-1")!;
    const q1 = template.questions[0];

    // Simulate an answer with recorded audio base64
    const fakeAudioBase64 = "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" + "A".repeat(600);

    HskkService.saveAnswer(session.id, q1.id, {
      questionId: q1.id,
      partNumber: q1.partNumber,
      questionIndex: q1.questionIndex,
      transcript: "随着现代科技的快速发展，人们的交流方式变得越来越便利。",
      audioBase64: fakeAudioBase64,
      durationSeconds: 3,
    });

    const result = await HskkService.evaluateSession(session.id);

    expect(result).not.toBeNull();
    expect(evaluateAudioSpy).toHaveBeenCalled();
    expect(result!.detailedQuestions[0].pronunciationQuality).toBe("EXCELLENT");
    expect(result!.detailedQuestions[0].tonesAccuracyScore).toBe(96);
    expect(result!.detailedQuestions[0].fluencyScore).toBe(92);
    expect(result!.detailedQuestions[0].phoneticsAnalysis?.tonesComment).toContain("Thanh điệu chuẩn xác");
    expect(result!.pronunciationScore).toBeGreaterThanOrEqual(90);
  });

  it("should gracefully fall back to transcript evaluation when audioBase64 is not provided", async () => {
    const evaluateAudioSpy = vi.spyOn(AIClient, "evaluateAudioWithGemini");

    const session = HskkService.createSession({
      userId: "test_text_user",
      templateId: "hskk-intermediate-std-1",
      mode: "PRACTICE",
    });

    const template = HskkService.getTemplateById("hskk-intermediate-std-1")!;
    const q1 = template.questions[0];

    // Accurate Chinese text matching q1
    HskkService.saveAnswer(session.id, q1.id, {
      questionId: q1.id,
      partNumber: q1.partNumber,
      questionIndex: q1.questionIndex,
      transcript: "随着现代科技的快速发展，人们的交流方式变得越来越便利。",
      durationSeconds: 8,
    });

    const result = await HskkService.evaluateSession(session.id);

    expect(result).not.toBeNull();
    // evaluateAudioWithGemini should not be called since there is no audioBase64
    expect(evaluateAudioSpy).not.toHaveBeenCalled();
    expect(result!.detailedQuestions[0].score).toBeGreaterThan(0);
  });

  it("should give 0 points and POOR rating when candidate reads Vietnamese or gibberish", async () => {
    const session = HskkService.createSession({
      userId: "test_gibberish_user",
      templateId: "hskk-intermediate-std-1",
      mode: "OFFICIAL",
    });

    const template = HskkService.getTemplateById("hskk-intermediate-std-1")!;
    const q1 = template.questions[0];

    // Candidate speaks Vietnamese gibberish
    HskkService.saveAnswer(session.id, q1.id, {
      questionId: q1.id,
      partNumber: q1.partNumber,
      questionIndex: q1.questionIndex,
      transcript: "alo alo một hai ba bốn em đọc linh tinh xem có được không nhé",
      durationSeconds: 5,
    });

    const result = await HskkService.evaluateSession(session.id);

    expect(result).not.toBeNull();
    expect(result!.detailedQuestions[0].score).toBe(0);
    expect(result!.detailedQuestions[0].pronunciationQuality).toBe("POOR");
    expect(result!.detailedQuestions[0].tonesAccuracyScore).toBe(0);
    expect(result!.detailedQuestions[0].feedback).toContain("Không phát hiện tiếng Trung có nghĩa");
    expect(result!.isPassed).toBe(false);
    expect(result!.overallScore).toBe(0);
  });

  it("should give 0 points when candidate in Part 1 repeats random unrelated Chinese characters", async () => {
    const session = HskkService.createSession({
      userId: "test_unrelated_user",
      templateId: "hskk-intermediate-std-1",
      mode: "OFFICIAL",
    });

    const template = HskkService.getTemplateById("hskk-intermediate-std-1")!;
    const q1 = template.questions[0]; // "随着现代科技的快速发展..."

    // Candidate repeats completely unrelated Chinese words
    HskkService.saveAnswer(session.id, q1.id, {
      questionId: q1.id,
      partNumber: q1.partNumber,
      questionIndex: q1.questionIndex,
      transcript: "苹果很好吃，我想去买香蕉。",
      durationSeconds: 4,
    });

    const result = await HskkService.evaluateSession(session.id);

    expect(result).not.toBeNull();
    expect(result!.detailedQuestions[0].score).toBe(0);
    expect(result!.detailedQuestions[0].pronunciationQuality).toBe("POOR");
    expect(result!.detailedQuestions[0].feedback).toContain("không nhắc lại đúng câu mẫu");
    expect(result!.isPassed).toBe(false);
  });
});
