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
          recognizedTranscript: "你好，我想去图书馆借一本书。",
          pinyinWithTones: "Nǐ hǎo, wǒ xiǎng qù túshūguǎn jiè yī běn shū.",
          score: 4.8,
          pronunciationQuality: "EXCELLENT",
          tonesAccuracyScore: 96,
          fluencyScore: 92,
          phoneticsAnalysis: {
            tonesComment: "Thanh điệu chuẩn xác, biến điệu hai thanh 3 rất tự nhiên.",
            initialsAndFinalsComment: "Phụ âm uốn lưỡi sh và thanh mẫu b/p rõ ràng.",
            pauseAndFluencyComment: "Tốc độ nói vừa phải, lưu loát.",
          },
          feedbackVi: "Phát âm rất tốt, ngữ điệu tự nhiên.",
          correction: "我想去图书馆借一本书。",
          pinyinCorrection: "Wǒ xiǎng qù túshūguǎn jiè yī běn shū.",
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
      transcript: "你好，我想去图书馆",
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

    // Only text transcript, no audio
    HskkService.saveAnswer(session.id, q1.id, {
      questionId: q1.id,
      partNumber: q1.partNumber,
      questionIndex: q1.questionIndex,
      transcript: "今天天气非常好。",
      durationSeconds: 2,
    });

    const result = await HskkService.evaluateSession(session.id);

    expect(result).not.toBeNull();
    // evaluateAudioWithGemini should not be called since there is no audioBase64
    expect(evaluateAudioSpy).not.toHaveBeenCalled();
    expect(result!.detailedQuestions[0].score).toBeGreaterThan(0);
  });
});
