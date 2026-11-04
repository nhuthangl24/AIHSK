import { describe, it, expect, vi } from "vitest";
import { FreeTalkService, FREE_TALK_PERSONAS } from "../src/lib/ai/free-talk-service";
import { POST } from "../src/app/api/free-talk/route";
import { NextRequest } from "next/server";
import * as sessionModule from "../src/lib/auth/session";

describe("Free Talk (Trò Chuyện Tự Do) Unit Tests", () => {
  describe("Personas Configuration", () => {
    it("should provide all core personas with rich metadata and initial suggestions", () => {
      const personaKeys = Object.keys(FREE_TALK_PERSONAS);
      expect(personaKeys).toContain("friendly_peer");
      expect(personaKeys).toContain("gentle_tutor");
      expect(personaKeys).toContain("travel_companion");

      for (const key of personaKeys) {
        const persona = FREE_TALK_PERSONAS[key];
        expect(persona.id).toBe(key);
        expect(persona.name).toBeTruthy();
        expect(persona.zhName).toBeTruthy();
        expect(persona.greeting).toBeTruthy();
        expect(persona.greetingPinyin).toBeTruthy();
        expect(persona.greetingVi).toBeTruthy();
        expect(persona.initialSuggestions.length).toBeGreaterThanOrEqual(2);
        for (const sug of persona.initialSuggestions) {
          expect(sug.zh).toBeTruthy();
          expect(sug.pinyin).toBeTruthy();
          expect(sug.vi).toBeTruthy();
        }
      }
    });
  });

  describe("FreeTalkService Conversational Generation", () => {
    it("should generate adaptive response for food/dining topics", async () => {
      const result = await FreeTalkService.generateReply({
        messages: [{ role: "user", content: "今天晚上我想吃四川火锅，听说很辣。" }],
        personaId: "friendly_peer",
      });

      expect(result.reply).toBeTruthy();
      expect(result.pinyin).toBeTruthy();
      expect(result.translation).toBeTruthy();
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
      // Food keywords in response
      expect(result.reply).toMatch(/美食|吃|辣|清淡/);
    });

    it("should generate empathetic response for work/study fatigue", async () => {
      const result = await FreeTalkService.generateReply({
        messages: [{ role: "user", content: "今天工作真的很累，加班到很晚。" }],
        personaId: "gentle_tutor",
      });

      expect(result.reply).toBeTruthy();
      expect(result.pinyin).toBeTruthy();
      expect(result.translation).toBeTruthy();
      expect(result.tip).toBeTruthy();
      expect(result.reply).toMatch(/辛苦|工作|休息|放松/);
    });

    it("should generate engaging response for weather and weekend plans", async () => {
      const result = await FreeTalkService.generateReply({
        messages: [{ role: "user", content: "周末天气很好，打算跟朋友出去玩。" }],
        personaId: "travel_companion",
      });

      expect(result.reply).toBeTruthy();
      expect(result.pinyin).toBeTruthy();
      expect(result.translation).toBeTruthy();
      expect(result.reply).toMatch(/天气|周末|出门/);
    });

    it("should handle general conversational turns gracefully", async () => {
      const result = await FreeTalkService.generateReply({
        messages: [{ role: "user", content: "你觉得学中文难不难？" }],
        personaId: "friendly_peer",
      });

      expect(result.reply).toBeTruthy();
      expect(result.pinyin).toBeTruthy();
      expect(result.translation).toBeTruthy();
      expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/free-talk Route Handler", () => {
    it("should return 401 when user is not authenticated", async () => {
      vi.spyOn(sessionModule, "getCurrentUser").mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost:3000/api/free-talk", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "你好" }],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when messages array is missing or invalid", async () => {
      vi.spyOn(sessionModule, "getCurrentUser").mockResolvedValueOnce({
        userId: "user_test",
        email: "test@aihsk.com",
        role: "USER" as any,
      });

      const req = new NextRequest("http://localhost:3000/api/free-talk", {
        method: "POST",
        body: JSON.stringify({
          messages: "not-an-array",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Danh sách tin nhắn");
    });

    it("should return successful response with reply and suggestions when authenticated", async () => {
      vi.spyOn(sessionModule, "getCurrentUser").mockResolvedValueOnce({
        userId: "user_test",
        email: "test@aihsk.com",
        role: "USER" as any,
      });

      const req = new NextRequest("http://localhost:3000/api/free-talk", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: "今天吃了好吃的米粉！" }],
          personaId: "friendly_peer",
          level: "HSK 2",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.reply).toBeTruthy();
      expect(data.pinyin).toBeTruthy();
      expect(data.translation).toBeTruthy();
      expect(Array.isArray(data.suggestions)).toBe(true);
    });
  });
});
