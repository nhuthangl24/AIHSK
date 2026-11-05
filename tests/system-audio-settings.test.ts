import { describe, it, expect, beforeEach } from "vitest";
import {
  FIXED_VOICE_NAME,
  FIXED_VOICE_LABEL,
  getSystemAudioSettings,
  saveSystemAudioSettings,
  isGoogleTaiwanVoice,
  isTaiwanVoice,
  isChineseVoice,
  getBestChineseVoice,
  cleanSpeechText,
} from "@/lib/audio/system-audio-settings";

describe("System Audio & Voice Synthesis Locking Unit Tests", () => {
  beforeEach(() => {
    // Reset localStorage mock
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it("should have correct constants defined for Google 國語（臺灣）", () => {
    expect(FIXED_VOICE_NAME).toBe("Google 國語（臺灣）");
    expect(FIXED_VOICE_LABEL).toContain("Google 國語（臺灣）");
    expect(FIXED_VOICE_LABEL).toContain("zh-TW");
  });

  it("should always enforce FIXED_VOICE_NAME even if legacy voice is in localStorage", () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "aihsk_system_audio_settings",
        JSON.stringify({
          voiceName: "Tingting (zh-CN)", // Stale/foreign voice
          playbackSpeed: 0.85,
          recognitionLang: "zh-TW",
        })
      );

      const settings = getSystemAudioSettings();
      expect(settings.voiceName).toBe(FIXED_VOICE_NAME);
      expect(settings.playbackSpeed).toBe(0.85);
    }
  });

  it("should always enforce FIXED_VOICE_NAME when saving audio settings", () => {
    const updated = saveSystemAudioSettings({
      voiceName: "Some Other Random Voice",
      playbackSpeed: 1.05,
    });

    expect(updated.voiceName).toBe(FIXED_VOICE_NAME);
    expect(updated.playbackSpeed).toBe(1.05);
  });

  it("should accurately identify Google Taiwan Mandarin voice across name variations", () => {
    const mockGoogleTw1 = { name: "Google 國語（臺灣）", lang: "zh-TW" } as SpeechSynthesisVoice;
    const mockGoogleTw2 = { name: "Google 國語 (臺灣)", lang: "zh-TW" } as SpeechSynthesisVoice;
    const mockGoogleTw3 = { name: "Google 國語 (台湾)", lang: "zh-TW" } as SpeechSynthesisVoice;
    const mockGoogleTw4 = { name: "Google Mandarin (Taiwan)", lang: "zh-TW" } as SpeechSynthesisVoice;

    expect(isGoogleTaiwanVoice(mockGoogleTw1)).toBe(true);
    expect(isGoogleTaiwanVoice(mockGoogleTw2)).toBe(true);
    expect(isGoogleTaiwanVoice(mockGoogleTw3)).toBe(true);
    expect(isGoogleTaiwanVoice(mockGoogleTw4)).toBe(true);
  });

  it("should strictly reject non-Taiwan voices in isGoogleTaiwanVoice", () => {
    const mainlandGoogle = { name: "Google 普通话（中国大陆）", lang: "zh-CN" } as SpeechSynthesisVoice;
    const cantoneseGoogle = { name: "Google 粤語（香港）", lang: "zh-HK" } as SpeechSynthesisVoice;
    const tingting = { name: "Tingting", lang: "zh-CN" } as SpeechSynthesisVoice;
    const englishVoice = { name: "Google US English", lang: "en-US" } as SpeechSynthesisVoice;

    expect(isGoogleTaiwanVoice(mainlandGoogle)).toBe(false);
    expect(isGoogleTaiwanVoice(cantoneseGoogle)).toBe(false);
    expect(isGoogleTaiwanVoice(tingting)).toBe(false);
    expect(isGoogleTaiwanVoice(englishVoice)).toBe(false);
  });

  it("should strictly prioritize Google 國語（臺灣） over all other voices", () => {
    const voices = [
      { name: "Google US English", lang: "en-US" },
      { name: "Tingting", lang: "zh-CN" },
      { name: "Google 普通话（中国大陆）", lang: "zh-CN" },
      { name: "Meijia", lang: "zh-TW" },
      { name: "Google 國語（臺灣）", lang: "zh-TW" },
    ] as SpeechSynthesisVoice[];

    const chosen = getBestChineseVoice(voices);
    expect(chosen).not.toBeNull();
    expect(chosen?.name).toBe("Google 國語（臺灣）");
  });

  it("should cleanly strip markdown, emojis, and stage notes for pure pronunciation", () => {
    const raw = "💡 (提示: Hãy nói to rõ) 你好！请问你今天怎么样？😊 [Stage 1: Warmup]";
    const cleaned = cleanSpeechText(raw);

    expect(cleaned).not.toContain("💡");
    expect(cleaned).not.toContain("😊");
    expect(cleaned).not.toContain("提示");
    expect(cleaned).not.toContain("Stage 1");
    expect(cleaned).toBe("你好！请问你今天怎么样？");
  });
});
