import { describe, it, expect } from "vitest";
import { AIClient, HHTECH_MODEL_CATALOG } from "../src/lib/ai/ai-client";

describe("AI Client & HHTECH.API Integration Tests", () => {
  it("should have comprehensive HHTECH model catalog with all major providers", () => {
    expect(HHTECH_MODEL_CATALOG.length).toBeGreaterThanOrEqual(4);

    const claudeGroup = HHTECH_MODEL_CATALOG.find((g) => g.group.includes("Claude"));
    expect(claudeGroup).toBeDefined();
    expect(claudeGroup?.models.some((m) => m.id === "claude-sonnet-4.6")).toBe(true);
    expect(claudeGroup?.models.some((m) => m.id === "claude-haiku-4.5")).toBe(true);

    const gptGroup = HHTECH_MODEL_CATALOG.find((g) => g.group.includes("GPT"));
    expect(gptGroup).toBeDefined();
    expect(gptGroup?.models.some((m) => m.id === "gpt-5.6-sol")).toBe(true);

    const geminiGroup = HHTECH_MODEL_CATALOG.find((g) => g.group.includes("Gemini"));
    expect(geminiGroup).toBeDefined();
    expect(geminiGroup?.models.some((m) => m.id === "gemini-3.7-flash")).toBe(true);

    const chinaGroup = HHTECH_MODEL_CATALOG.find((g) => g.group.includes("China"));
    expect(chinaGroup).toBeDefined();
    expect(chinaGroup?.models.some((m) => m.id === "deepseek-v4.1-flash")).toBe(true);
  });

  it("should robustly extract JSON from pure JSON strings", () => {
    const jsonStr = '{"examinerResponse": "你好！", "stage": 1, "isCompleted": false}';
    const parsed = AIClient.extractJson(jsonStr);
    expect(parsed.examinerResponse).toBe("你好！");
    expect(parsed.stage).toBe(1);
  });

  it("should extract JSON embedded in markdown fences (```json ... ```)", () => {
    const markdownStr = `
Here is your evaluation response:
\`\`\`json
{
  "stage": 2,
  "examinerResponse": "听起来很有意思！",
  "pinyin": "Tīng qǐlái hěn yǒu yìsi!",
  "isCompleted": false
}
\`\`\`
Hope this helps!`;

    const parsed = AIClient.extractJson(markdownStr);
    expect(parsed.stage).toBe(2);
    expect(parsed.examinerResponse).toBe("听起来很有意思！");
  });

  it("should extract JSON with leading/trailing commentary without fences", () => {
    const raw = `Exam output: {"stage": 3, "score": 88} (end of message)`;
    const parsed = AIClient.extractJson(raw);
    expect(parsed.stage).toBe(3);
    expect(parsed.score).toBe(88);
  });

  it("should throw error if no JSON can be extracted", () => {
    expect(() => AIClient.extractJson("This is just plain text without any brackets.")).toThrow(
      /Failed to extract valid JSON/
    );
  });

  it("should retrieve active config with HHTECH defaults", async () => {
    const config = await AIClient.getActiveConfig();
    expect(config.baseUrl).toContain("hhtechapi.net");
    expect(config.modelId).toBeDefined();
  });
});
