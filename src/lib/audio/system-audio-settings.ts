"use client";

export interface SystemAudioSettings {
  voiceName: string;
  playbackSpeed: number; // 0.85, 0.95, 1.05
  recognitionLang: string; // "zh-TW" | "zh-CN"
  showPinyin: boolean;
}

const STORAGE_KEY = "aihsk_system_audio_settings";
const SETTINGS_EVENT = "aihsk_audio_settings_changed";

export const FIXED_VOICE_NAME = "Google 國語（臺灣）";
export const FIXED_VOICE_LABEL = "✓ Google 國語（臺灣） (zh-TW) ⭐ [Khuyên dùng]";

const DEFAULT_SETTINGS: SystemAudioSettings = {
  voiceName: FIXED_VOICE_NAME,
  playbackSpeed: 0.95,
  recognitionLang: "zh-TW",
  showPinyin: true,
};

export function getSystemAudioSettings(): SystemAudioSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        voiceName: parsed.voiceName || DEFAULT_SETTINGS.voiceName,
        playbackSpeed: typeof parsed.playbackSpeed === "number" ? parsed.playbackSpeed : DEFAULT_SETTINGS.playbackSpeed,
        recognitionLang: parsed.recognitionLang || DEFAULT_SETTINGS.recognitionLang,
        showPinyin: typeof parsed.showPinyin === "boolean" ? parsed.showPinyin : DEFAULT_SETTINGS.showPinyin,
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSystemAudioSettings(updates: Partial<SystemAudioSettings>): SystemAudioSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const current = getSystemAudioSettings();
    const updated: SystemAudioSettings = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for cross-component reactive sync
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function getAvailableChineseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(
    (v) =>
      v.name === FIXED_VOICE_NAME ||
      (v.name.includes("Google") && (v.name.includes("國語") || v.name.includes("Taiwan") || v.lang === "zh-TW"))
  );
  if (match) return [match];

  // If Google 國語（臺灣） is not installed (e.g. Safari), return the single closest Chinese voice
  const fallback = getBestChineseVoice(voices);
  return fallback ? [fallback] : [];
}

export function getBestChineseVoice(
  voices: SpeechSynthesisVoice[],
  _preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Strictly prioritize Google 國語（臺灣）
  const googleTw = voices.find(
    (v) =>
      v.name === FIXED_VOICE_NAME ||
      (v.name.includes("Google") && (v.name.includes("國語") || v.name.includes("Taiwan") || v.lang === "zh-TW"))
  );
  if (googleTw) return googleTw;

  // Fallbacks for non-Chromium browsers (e.g. Safari on iOS/macOS)
  const zhTw = voices.find((v) => v.lang === "zh-TW" || v.lang === "zh_TW");
  if (zhTw) return zhTw;

  const anyZh = voices.find(
    (v) =>
      v.lang.startsWith("zh") ||
      v.lang.includes("cmn") ||
      v.name.includes("Chinese") ||
      v.name.includes("Taiwan") ||
      v.name.includes("國語")
  );

  return anyZh || voices[0] || null;
}

export function cleanSpeechText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, "")
    .replace(/[\(\[（【].*?[\)\]）】]/g, "")
    .replace(/💡|•|&bull;|&quot;|“|”/g, "")
    .trim();
}

interface SpeakOptions {
  speedOverride?: number;
  voiceNameOverride?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

export function speakWithSystemSettings(
  text: string,
  options?: SpeakOptions
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  window.speechSynthesis.cancel();

  const clean = cleanSpeechText(text);
  if (!clean) return null;

  const settings = getSystemAudioSettings();
  const utterance = new SpeechSynthesisUtterance(clean);

  utterance.lang = settings.recognitionLang || "zh-TW";
  utterance.rate = options?.speedOverride || settings.playbackSpeed || 0.95;
  utterance.pitch = 1.0;

  const allVoices = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
  const targetVoice = getBestChineseVoice(allVoices, FIXED_VOICE_NAME);
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    options?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSystemSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
