"use client";

export interface SystemAudioSettings {
  voiceName: string;
  playbackSpeed: number; // 0.85, 0.95, 1.05
  recognitionLang: string; // "zh-TW" | "zh-CN"
  showPinyin: boolean;
}

const STORAGE_KEY = "aihsk_system_audio_settings";
const SETTINGS_EVENT = "aihsk_audio_settings_changed";

const DEFAULT_SETTINGS: SystemAudioSettings = {
  voiceName: "Google 國語（臺灣）",
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
  return voices.filter(
    (v) =>
      v.lang.startsWith("zh") ||
      v.lang.includes("cmn") ||
      v.lang.includes("Chinese") ||
      v.name.includes("Chinese") ||
      v.name.includes("Taiwan") ||
      v.name.includes("Mandarin") ||
      v.name.includes("國語") ||
      v.name.includes("普通话")
  );
}

export function getBestChineseVoice(
  voices: SpeechSynthesisVoice[],
  preferredVoiceName?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (preferredVoiceName) {
    const exact = voices.find((v) => v.name === preferredVoiceName);
    if (exact) return exact;
    const partial = voices.find((v) => v.name.toLowerCase().includes(preferredVoiceName.toLowerCase()));
    if (partial) return partial;
  }

  // Priority order for natural standard voices
  const preferred =
    voices.find((v) => v.name.includes("Google") && v.name.includes("國語")) ||
    voices.find((v) => v.name.includes("Google") && v.name.includes("普通话")) ||
    voices.find((v) => v.name.includes("Microsoft") && (v.name.includes("Xiaoxiao") || v.name.includes("Yunxi"))) ||
    voices.find((v) => v.name.includes("Ting-Ting") || v.name.includes("Mei-Jia") || v.name.includes("Sin-ji")) ||
    voices.find((v) => v.lang === "zh-TW") ||
    voices.find((v) => v.lang === "zh-CN") ||
    voices[0];

  return preferred || null;
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

  utterance.lang = settings.recognitionLang || "zh-CN";
  utterance.rate = options?.speedOverride || settings.playbackSpeed || 0.95;
  utterance.pitch = 1.0;

  const voices = getAvailableChineseVoices();
  const targetVoice = getBestChineseVoice(voices, options?.voiceNameOverride || settings.voiceName);
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
